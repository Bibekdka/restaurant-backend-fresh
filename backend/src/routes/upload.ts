import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'restaurant-app',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    } as any, // Type cast for 'folder' property support
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), (req, res) => {
    if (req.file && req.file.path) {
        res.status(200).json({ url: req.file.path });
    } else {
        res.status(400).json({ message: 'Image upload failed' });
    }
});

export default router;
