const express = require('express');
const { searchPostController } = require('../controllers/search-controller');
const { authenticateRequest } = require("../middleware/authMiddleware");
const router = express.Router();
router.use(authenticateRequest)
router.get('/search-posts', searchPostController);

module.exports = router