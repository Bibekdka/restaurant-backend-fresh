"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Config Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️  Cloudinary credentials not configured');
}
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'restaurant-app',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        resource_type: 'auto',
    },
});
const fileFilter = (req, file, cb) => {
    // Only allow image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Only JPG and PNG files are allowed'));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});
// Upload image endpoint (auth required)
router.post('/', auth_1.authenticate, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        if (!req.file.path) {
            return res.status(400).json({ message: 'Image upload failed' });
        }
        res.status(200).json({
            url: req.file.path,
            public_id: req.file.public_id || '',
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(400).json({ message: error.message || 'Image upload failed' });
    }
});
exports.default = router;
