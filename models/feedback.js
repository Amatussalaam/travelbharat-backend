const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    name: String,
    email: String,
    rating: Number,
    feedback: String
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);