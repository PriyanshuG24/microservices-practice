const logger = require("../utils/logger")
const { uploadMediaToCloudinary } = require("../utils/cloudinary")
const Media = require("../models/Media")
const uploadMedia = async (req, res) => {
    logger.info("Uploading media to cloudinary")
    console.log(req.file, "req.file")
    try {
        if (!req.file) {
            logger.error("No file uploaded")
            return res.status(400).json({ success: false, message: "No file uploaded!Please upload a file" })
        }
        const { originalname, mimetype } = req.file;
        const userId = req.user.userId;
        logger.info(`File Details: name=${originalname} type=${mimetype}`)
        logger.info('Uploading file to cloudinary is in progress')

        const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file)
        logger.info(`File uploaded to cloudinary successfully. Public ID:- ${cloudinaryUploadResult.public_id}`)
        const newlyCreatedMedia = new Media({
            userId,
            originalName: originalname,
            mimeType: mimetype,
            url: cloudinaryUploadResult.secure_url,
            publicId: cloudinaryUploadResult.public_id
        })
        const savedMedia = await newlyCreatedMedia.save()
        logger.info(`Media uploaded successfully on database. ID:- ${savedMedia._id}`)
        return res.status(201).json(
            {
                success: true,
                message: "Media uploaded successfully",
                mediaId: newlyCreatedMedia._id,
                url: newlyCreatedMedia.url
            })
    } catch (error) {
        logger.error("Error uploading media to cloudinary", error)
        return res.status(500).json({ success: false, message: "Error uploading media to cloudinary", error: error.message })
    }
}

const getAllMedias = async (req, res) => {
    try {
        const medias = await Media.find({})
        return res.status(200).json({ success: true, message: "Medias fetched successfully", medias })
    } catch (error) {
        logger.error("Error fetching medias", error)
        return res.status(500).json({ success: false, message: "Error fetching medias", error: error.message })
    }
}


module.exports = { uploadMedia, getAllMedias }