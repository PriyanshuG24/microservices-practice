const logger = require('../utils/logger');
const Search = require('../models/Search');


const searchPostController = async (req, res) => {
    logger.info('Search endpoint hit')
    try {
        const { query } = req.query;
        const cacheKey = `search:${query}`
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' })
        }
        const cachedResults = await req.redisClient.get(cacheKey)
        if (cachedResults) {
            logger.info('Search results fetched from cache')
            return res.status(200).json({ success: true, data: JSON.parse(cachedResults) })
        }
        const results = await Search.find(
            {
                $text: { $search: query }
            },
            {
                score: { $meta: 'textScore' }
            }
        ).sort({ score: { $meta: 'textScore' } }).limit(10)
        await req.redisClient.setex(cacheKey, 5 * 60, JSON.stringify(results))
        return res.status(200).json({ success: true, data: results })
    } catch (error) {
        logger.error('Search endpoint error', error)
        res.status(500).json({ success: false, message: 'Error searching posts' })
    }
}

module.exports = {
    searchPostController
}