require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const mediaRoutes = require('./routes/media-routes')
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/logger')
const { connectRabbitMQ } = require('./utils/rabbitmq')
const { consumeEvent } = require('./utils/rabbitmq')
const { handlerPostdelete } = require('./eventHandlers/media-event-handlers')

const app = express()
const port = process.env.PORT || 3003

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => logger.info('Connected to mongodb'))
    .catch((e) => { logger.error("Mongo connection error", e) })


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
app.use('/api/media', mediaRoutes)

app.use(errorHandler)

//consume events
async function startServer() {
    try {
        app.listen(port, () => {
            logger.info(`Media service running on port ${port}`)
        })
        await connectRabbitMQ()
        //consume all the events
        await consumeEvent('post.deleted', handlerPostdelete)
    } catch (error) {
        logger.error("Error connecting to RabbitMQ", error)
    }
}

startServer()

process.on('unhandledRejection', (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason", reason)
})



