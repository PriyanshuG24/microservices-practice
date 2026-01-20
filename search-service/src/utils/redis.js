const Redis = require('ioredis');
const logger = require('./logger');
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('connect', () => {
    logger.info('Search Redis connected');
    console.log('Search Redis connected');
});

redisClient.on('error', (err) => {
    logger.error('Search Redis error', err);
    console.error('Search Redis error', err);
});

module.exports = redisClient;
