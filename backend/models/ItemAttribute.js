import mongoose from "mongoose";

const itemAttributeSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    attributeName: { type: String, required: true },
    attributeValue: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('ItemAttribute', itemAttributeSchema);
