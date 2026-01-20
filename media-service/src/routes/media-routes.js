const express = require("express")
const multer = require("multer")

const { uploadMedia, getAllMedias } = require("../controllers/media-controller")
const { authenticateRequest } = require("../middleware/authMiddleware")
const logger = require("../utils/logger")

const router = express.Router()

//configure multer for file upload

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single("file")

router.post("/upload", authenticateRequest, (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            logger.error("Multer error", err)
            return res.status(400).json({ success: false, message: "Multer error", error: err.message, stack: err.stack })
        }
        else if (err) {
            logger.error("Unknown error while uploading file", err)
            return res.status(500).json({ success: false, message: "Unknown error while uploading file", error: err.message, stack: err.stack })
        }
        const file = req.file
        if (!file) {
            logger.error("No file uploaded")
            return res.status(400).json({ success: false, message: "No file uploaded!Please upload a file" })
        }
        next()
    })
}, uploadMedia)

router.get("/get-all-media", authenticateRequest, getAllMedias)

module.exports = router