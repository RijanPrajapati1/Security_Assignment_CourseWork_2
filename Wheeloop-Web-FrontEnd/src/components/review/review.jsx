import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";

const Review = ({ carId, userId }) => {
    const [reviewText, setReviewText] = useState("");
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
        fetchUserReview();
    }, [carId, userId]);

    // Fetch all reviews for a car
    const fetchReviews = async () => {
        try {
            const response = await axiosInstance.get(`/review/${carId}`);
            setReviews(response.data.reviews);
        } catch (error) {
            console.error("Error fetching reviews:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's review
    const fetchUserReview = async () => {
        try {
            const response = await axiosInstance.get(`/review/user/${userId}/car/${carId}`);
            setReviewText(response.data.reviewText);
        } catch (error) {
            console.error("User has not reviewed this car yet.");
        }
    };

    // Submit or Update Review
    const handleReviewSubmit = async () => {
        try {
            await axiosInstance.post("/review/submit", { userId, carId, reviewText });
            fetchReviews(); // Refresh reviews
        } catch (error) {
            console.error("Error submitting review:", error.response?.data || error.message);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4 w-full">
            {/* Submit Review */}
            <textarea
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
            />
            <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                onClick={handleReviewSubmit}
            >
                Submit Review
            </button>

            {/* Reviews List */}
            <div className="w-full">
                <h3 className="text-lg font-semibold text-gray-800">User Reviews:</h3>
                {loading ? (
                    <p>Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="border-b py-2">
                            <p className="text-gray-700">{review.reviewText}</p>
                            <p className="text-xs text-gray-500">By: {review.userId?.email || "Anonymous"}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Review;
