const logger = require('../utils/logger')
const Search = require("../models/Search")

async function handlePostCreatedEvent(event) {
    try {
        const search = new Search({
            userId: event.userId,
            postId: event.postId,
            content: event.content,
            createdAt: event.createdAt
        })
        await search.save()
        logger.info(`Post created event handled successfully ${event.postId} , ${search._id.toString()}`)
    } catch (error) {
        logger.error('Error handling post created event', error)
    }
}
async function handlePostDeletedEvent(event) {
    try {
        await Search.findOneAndDelete({ postId: event.postId })
        logger.info(`Post deleted event handled successfully ${event.postId}`)
    } catch (error) {
        logger.error('Error handling post deleted event', error)
    }
}

module.exports = {
    handlePostCreatedEvent,
    handlePostDeletedEvent
}