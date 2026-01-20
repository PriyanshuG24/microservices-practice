require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const postRoutes = require('./routes/post-routes');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/logger');
const { connectRabbitMQ } = require('./utils/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3002;


mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info('Connected to mongodb'))
    .catch((e) => { logger.error("Mongo connection error", e) })

const redisClient = new Redis(process.env.REDIS_URL);

//middleware 
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info('Request body', req.body)
    next();
});

//routes
app.use('/api/posts', (req, res, next) => {
    req.redisClient = redisClient;
    next();
}, postRoutes)

app.use(errorHandler)

async function startServer() {
    try {
        app.listen(PORT, () => {
            logger.info(`Post service running on port ${PORT}`)
        })
        await connectRabbitMQ();
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
}

startServer();


process.on('unhandledRejection', (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason", reason)
})
