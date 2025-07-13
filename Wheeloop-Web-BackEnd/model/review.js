const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Cred", required: true },
    carId: { type: mongoose.Schema.Types.ObjectId, ref: "cars", required: true },
    reviewText: { type: String, required: true, maxlength: 500 },
}, { timestamps: true });

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
