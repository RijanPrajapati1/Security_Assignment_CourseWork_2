const Review = require("../model/review");
// const User = require("../model/user");  // ✅ Add this
// const Car = require("../model/car");

// Submit or update a review
const submitReview = async (req, res) => {
    try {
        const { userId, carId, reviewText } = req.body;

        // Check if the user already reviewed this car
        const existingReview = await Review.findOne({ userId, carId });

        if (existingReview) {
            existingReview.reviewText = reviewText; // Update review text
            await existingReview.save();
            return res.status(200).json({ message: "Review updated successfully." });
        }

        // Create a new review
        const newReview = new Review({ userId, carId, reviewText });
        await newReview.save();
        return res.status(201).json({ message: "Review submitted successfully." });

    } catch (error) {
        res.status(500).json({ message: "Error submitting review.", error: error.message });
    }
};

// ✅ Get all reviews for a car
const getCarReviews = async (req, res) => {
    try {
        const { carId } = req.params;

        const reviews = await Review.find({ carId }).populate("userId", "name"); // Populate user name

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews available for this car." });
        }

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ message: "Error fetching car reviews.", error: error.message });
    }
};



// Get a user's review for a specific car
const getUserCarReview = async (req, res) => {
    try {
        const { userId, carId } = req.params;
        const review = await Review.findOne({ userId, carId });

        if (!review) {
            return res.status(404).json({ message: "No review found for this user and car." });
        }

        res.status(200).json({ reviewText: review.reviewText });

    } catch (error) {
        res.status(500).json({ message: "Error fetching user review.", error: error.message });
    }
};

//  Get All Reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("userId", "full_name")  // Fetch user name
            .populate("carId", "name");  // Fetch car name

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews available." });
        }

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews.", error: error.message });
    }
};

// Update Review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reviewText } = req.body;

        const updatedReview = await Review.findByIdAndUpdate(reviewId, { reviewText }, { new: true });

        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found." });
        }

        res.status(200).json({ success: true, message: "Review updated.", updatedReview });
    } catch (error) {
        res.status(500).json({ message: "Error updating review.", error: error.message });
    }
};

// Delete Review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const deletedReview = await Review.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return res.status(404).json({ message: "Review not found." });
        }

        res.status(200).json({ success: true, message: "Review deleted." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting review.", error: error.message });
    }
};

module.exports = { submitReview, getCarReviews, getUserCarReview, getAllReviews, updateReview, deleteReview };
