const express = require("express");
const { submitReview, getCarReviews, getUserCarReview, getAllReviews, updateReview, deleteReview } = require("../controller/review_controller");

const router = express.Router();

// Submit or update review
router.post("/submit", submitReview);

/// Get all reviews for a car 
router.get("/car/:carId", getCarReviews);

// Get a user's review for a specific car
router.get("/user/:userId/car/:carId", getUserCarReview);


router.get("/all", getAllReviews); //  Fetch all reviews
router.put("/update/:reviewId", updateReview); //  Update review
router.delete("/delete/:reviewId", deleteReview);


module.exports = router;
