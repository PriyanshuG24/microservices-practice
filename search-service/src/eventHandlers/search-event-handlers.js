const logger = require('../utils/logger')
const Search = require("../models/Search")
const redisClient = require("../utils/redis")

async function handlePostCreatedEvent(event) {
    try {
        const search = new Search({
            userId: event.userId,
            postId: event.postId,
            content: event.content,
            createdAt: event.createdAt
        })
        await search.save()

        logger.info(`Post created event handled successfully ${event.postId} , ${search._id.toString()}`)
        const keys = await redisClient.keys(`search:*`)
        if (keys.length > 0) {
            await redisClient.del(keys)
        }
        logger.info(`Search cache invalidated successfully`)
    } catch (error) {
        logger.error('Error handling post created event', error)
    }
}
async function handlePostDeletedEvent(event) {
    try {
        await Search.findOneAndDelete({ postId: event.postId })
        logger.info(`Post deleted event handled successfully ${event.postId}`)
        const keys = await redisClient.keys(`search:*`)
        if (keys.length > 0) {
            await redisClient.del(keys)
        }
        logger.info(`Search cache invalidated successfully`)
    } catch (error) {
        logger.error('Error handling post deleted event', error)
    }
}

module.exports = {
    handlePostCreatedEvent,
    handlePostDeletedEvent
}