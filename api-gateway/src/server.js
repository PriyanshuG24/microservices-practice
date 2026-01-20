require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Redis = require('ioredis')
const helmet = require('helmet')
const logger = require('./utils/logger')
const proxy = require('express-http-proxy')
const errorHandler = require('./middleware/errorHandler')
const { rateLimit } = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const validateToken = require('./middleware/authMiddleware')

const app = express()
const PORT = process.env.PORT || 3000;
const redisClient = new Redis(process.env.REDIS_URL)

app.use(helmet())
app.use(cors())
app.use(express.json())

const rateLimitForApiGateway = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive Endpoints rate limit exceeded for ip:${req.ip}`)
        res.status(429).json({
            success: false,
            message: "Too many request"
        })
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    })
});

app.use(rateLimitForApiGateway)

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info('Request body', req.body)
    next();
});

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api")
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error ${err.message}`)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        })
    }
}

// setting up proxy for your identity service

app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = "application/json"
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Response received from indentity service:${proxyRes.statusCode}`)
        return proxyResData
    }
}))

//setting up proxy for our post service

app.use('/v1/posts', validateToken, proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = "application/json"
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, _userReq, _userRes) => {
        logger.info(`Response received from post service:${proxyRes.statusCode}`)
        return proxyResData
    }
}))

//setting up proxy for our media service

app.use('/v1/media', validateToken, proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
        const contentType = srcReq.headers['content-type'] || srcReq.headers['Content-Type'];
        if (!contentType || !contentType.startsWith("multipart/form-data")) {
            proxyReqOpts.headers['Content-Type'] = "application/json";
        }
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, _userReq, _userRes) => {
        logger.info(`Response received from media service:${proxyRes.statusCode}`)
        return proxyResData
    },
    parseReqBody: false
}))

//setting up proxy for our search service
app.use('/v1/search', validateToken, proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['Content-Type'] = "application/json"
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId
        return proxyReqOpts
    },
    userResDecorator: (proxyRes, proxyResData, _userReq, _userRes) => {
        logger.info(`Response received from post service:${proxyRes.statusCode}`)
        return proxyResData
    }
}))


app.use(errorHandler)
app.listen(PORT, () => {
    logger.info(`Api gateway is running on port ${PORT}`)
    logger.info(`Identity serice is running on this URL: ${process.env.IDENTITY_SERVICE_URL}`)
    logger.info(`Post serice is running on this URL: ${process.env.POST_SERVICE_URL}`)
    logger.info(`Media serice is running on this URL: ${process.env.MEDIA_SERVICE_URL}`)
    logger.info(`Search serice is running on this URL: ${process.env.SEARCH_SERVICE_URL}`)
    logger.info(`Redis Url: ${process.env.REDIS_URL}`)
})

