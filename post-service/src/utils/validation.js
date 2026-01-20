const Joi = require('joi')

const validatePost = (data) => {
    const schema = Joi.object({
        content: Joi.string().min(3).max(3000).required(),
        mediaIds: Joi.array().optional()
    })
    return schema.validate(data)
}

module.exports = { validatePost }