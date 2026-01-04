import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: false }, // Optional review image
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who created it
    name: { type: String, required: true },
    image: { type: String, required: true }, // Main thumbnail
    images: [{
        url: { type: String, required: true },
        public_id: { type: String, required: false }, // For Cloudinary deletion
    }],
    category: { type: String, required: true },
    description: { type: String, required: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
