const logger = require("../utils/logger");
const Post = require("../models/Post");
const { validatePost } = require("../utils/validation");
const { publishEvent } = require("../utils/rabbitmq");

async function invalidatePostCache(req, input) {
    const cacheKey = `post:${input}`
    await req.redisClient.del(cacheKey)
    const keys = await req.redisClient.keys(`posts:*`)
    if (keys.length > 0) {
        await req.redisClient.del(keys)
    }
}

const createPost = async (req, res) => {
    logger.info("Hit create post endpoint", req.body);
    try {
        const { error } = validatePost(req.body);
        if (error) {
            logger.warn("Validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        const { content, mediaIds } = req.body;
        const post = new Post({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || [],
        });
        await post.save();

        await publishEvent('post.created', {
            postId: post._id.toString(),
            userId: req.user.userId,
            content: post.content,
            createdAt: post.createdAt
        })


        logger.info("Post created successfully", post);
        await invalidatePostCache(req, post._id.toString())
        return res
            .status(201)
            .json({ success: true, message: "Post created successfully", post });
    } catch (error) {
        logger.error("Error creating post", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to create post" });
    }
};

const getAllPosts = async (req, res) => {
    logger.info("Hit get all posts endpoint");
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const cacheKey = `posts:${page}:${limit}`
        const cachedPosts = await req.redisClient.get(cacheKey)
        if (cachedPosts) {
            logger.info("Posts fetched from cache")
            return res.status(200).json({ success: true, message: "Posts fetched successfully", posts: JSON.parse(cachedPosts) });
        }
        const posts = await Post.find({}).skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await Post.countDocuments();
        const result = {
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total,
        }
        await req.redisClient.setex(cacheKey, 5 * 60, JSON.stringify(result))
        return res.status(200).json({ success: true, message: "Posts fetched successfully", result });
    } catch (error) {
        logger.error("Error creating post", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to create post" });
    }
};

const getPostById = async (req, res) => {
    logger.info("Hit get post by id endpoint", req.params.id);

    try {
        const postId = req.params.id;
        const cachekey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cachekey);
        if (cachedPost) {
            logger.info("Post fetched from cache")
            return res.status(200).json({ success: true, message: "Post fetched successfully", post: JSON.parse(cachedPost) });
        }
        const postById = await Post.findById(postId);

        if (!postById) {
            logger.info("Post not found")
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        await req.redisClient.setex(cachekey, 5 * 60, JSON.stringify(postById))
        return res.status(200).json({ success: true, message: "Post fetched successfully", post: postById });
    } catch (error) {
        logger.error("Error creating post", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to create post" });
    }
}

const deletePost = async (req, res) => {
    logger.info("Hit delete post endpoint", req.params.id);
    try {
        const postId = req.params.id;
        const userId = req.user.userId;
        const post = await Post.findOneAndDelete({
            _id: postId,
            user: userId
        });
        if (!post) {
            logger.info("Post not found")
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        //publish post deleted event
        await publishEvent('post.deleted', {
            postId: post._id.toString(),
            userId: req.user.userId,
            mediaIds: post.mediaIds
        });

        await invalidatePostCache(req, postId)
        return res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        logger.error("Error deleting post", error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to delete post" });
    }
}

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
};
