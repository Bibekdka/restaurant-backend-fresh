import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profileImage: { type: String, required: false },
    address: { type: String, required: false },
    phone: { type: String, required: false },
    preferences: {
        dietary: [String],
        cuisines: [String],
    }
}, {
    timestamps: true
});

export const User = mongoose.model('User', userSchema);
