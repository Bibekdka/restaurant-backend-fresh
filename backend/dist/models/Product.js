"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
const productSchema = new mongoose_1.default.Schema({
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
        get: function () {
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
exports.Product = mongoose_1.default.model('Product', productSchema);
