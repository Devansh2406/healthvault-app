import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    fileData: { type: String }, // Base64 or URL (Using Base64 for simplicity in prototype)
    fileName: { type: String },
    analysis: { type: String },
    summary: { type: String },
    riskLevel: { type: String },
    keyFindings: [{ type: String }],
}, { timestamps: true });

export const Report = mongoose.model('Report', reportSchema);
