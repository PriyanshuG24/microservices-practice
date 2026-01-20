const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')
const validateToken = (req, res, next) => {
    const authHeader = req.get('authorization')
    if (!authHeader) {
        logger.error("Access attempt without authorization header")
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
    const token = authHeader.split(" ")[1]
    if (!token) {
        logger.error("Access attempt without token")
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.error("Invalid token")
            return res.status(429).json({
                success: false,
                message: "Unauthorized"
            })
        }
        req.user = user
        next()
    })
}
module.exports = validateToken