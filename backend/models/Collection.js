import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    privacyStatus: { type: String, enum: ['public', 'private'], default: 'public' },
}, { timestamps: true });

export default mongoose.model('Collection', collectionSchema);
