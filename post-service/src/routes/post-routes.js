const express = require("express");
const { createPost, getAllPosts, getPostById, deletePost } = require("../controllers/post-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");

const router = express.Router();

//middleware ->this will tell if the use is an auth user or not

router.use(authenticateRequest);
router.post("/create-post", createPost);
router.get("/get-all-posts", getAllPosts);
router.get("/get-post/:id", getPostById);
router.delete("/delete-post/:id", deletePost);

module.exports = router;
