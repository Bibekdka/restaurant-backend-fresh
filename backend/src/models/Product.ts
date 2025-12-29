import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    brand: { type: String, required: false },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    // Support multiple images
    images: [{
        url: { type: String, required: true },
        public_id: { type: String, required: false }, // For Cloudinary deletion
    }],
    // Keep single image for backward compatibility (first image in array)
    image: {
        type: String,
        required: false,
        get: function(this: any) {
            return this.images && this.images.length > 0 ? this.images[0].url : '';
        }
    },
    countInStock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    reviews: [reviewSchema],
}, {
    timestamps: true,
    getters: true
});

export const Product = mongoose.model('Product', productSchema);
