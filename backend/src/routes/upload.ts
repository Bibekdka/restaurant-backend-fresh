import express, { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️  Cloudinary credentials not configured');
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'restaurant-app',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        resource_type: 'auto',
    } as any,
});

const fileFilter = (req: Request, file: any, cb: any) => {
    // Only allow image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Only JPG and PNG files are allowed'));
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

// Upload image endpoint (auth required)
router.post('/', authenticate, upload.single('image'), (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        if (!req.file.path) {
            return res.status(400).json({ message: 'Image upload failed' });
        }

        res.status(200).json({
            url: req.file.path,
            public_id: (req.file as any).public_id || '',
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(400).json({ message: error.message || 'Image upload failed' });
    }
});

export default router;
