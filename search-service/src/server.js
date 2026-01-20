require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/logger');
const searchRoutes = require('./routes/search-routes');
const { connectRabbitMQ, consumeEvent } = require('./utils/rabbitmq');
const { handlePostCreatedEvent, handlePostDeletedEvent } = require('./eventHandlers/search-event-handlers');


const app = express();
const PORT = process.env.PORT || 3004;


mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info('Connected to mongodb'))
    .catch((e) => { logger.error("Mongo connection error", e) })

const redisClient = new Redis(process.env.REDIS_URL);

//middleware 
app.use(helmet())
app.use(cors())
app.use(express.json())

//implementing ip based rate limiting for sensitive endpoints

//implemnting redis cache
app.use('/api/search', searchRoutes)

app.use(errorHandler)

async function startServer() {
    try {
        await connectRabbitMQ();
        await consumeEvent('post.created', handlePostCreatedEvent)
        await consumeEvent('post.deleted', handlePostDeletedEvent)
        app.listen(PORT, () => {
            logger.info(`Search service running on port ${PORT}`)
        })
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
}

startServer();

process.on('unhandledRejection', (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason", reason)
})
