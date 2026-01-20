const logger = require("../utils/logger")
const Media = require("../models/Media")
const { deleteMediaToCloudinary } = require('../utils/cloudinary')
const handlerPostdelete = async (event) => {
    console.log("Post deleted", event)
    const { postId, mediaIds } = event
    try {
        const mediaToDelete = await Media.find({ _id: { $in: mediaIds } })
        for (const media of mediaToDelete) {
            await deleteMediaToCloudinary(media.publicId)
            await Media.deleteOne(media._id)
        }
        logger.info("Media deleted successfully from cloudinary and database", mediaIds)
    } catch (error) {
        logger.error("Error deleting post", error)
    }
}

module.exports = {
    handlerPostdelete
}