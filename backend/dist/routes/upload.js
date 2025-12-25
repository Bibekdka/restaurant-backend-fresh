"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const router = express_1.default.Router();
// Config Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'restaurant-app',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    }, // Type cast for 'folder' property support
});
const upload = (0, multer_1.default)({ storage: storage });
router.post('/', upload.single('image'), (req, res) => {
    if (req.file && req.file.path) {
        res.status(200).json({ url: req.file.path });
    }
    else {
        res.status(400).json({ message: 'Image upload failed' });
    }
});
exports.default = router;
