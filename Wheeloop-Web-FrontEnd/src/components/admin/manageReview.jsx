import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";

const ManageReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingReview, setEditingReview] = useState(null);
    const [editedText, setEditedText] = useState("");

    //  Fetch all reviews
    useEffect(() => {
        fetchAllReviews();
    }, []);

    const fetchAllReviews = async () => {
        try {
            const response = await axiosInstance.get("/review/all");
            setReviews(response.data.reviews || []);
        } catch (error) {
            console.error("❌ Error fetching reviews:", error.response?.data || error.message);
            setError("Failed to fetch reviews.");
        } finally {
            setLoading(false);
        }
    };

    // Handle edit mode
    const handleEdit = (review) => {
        setEditingReview(review._id);
        setEditedText(review.reviewText);
    };

    // Update Review
    const handleUpdate = async (reviewId) => {
        try {
            await axiosInstance.put(`/review/update/${reviewId}`, { reviewText: editedText });
            setEditingReview(null);
            fetchAllReviews(); // Refresh list
        } catch (error) {
            console.error("❌ Error updating review:", error.response?.data || error.message);
        }
    };

    // Delete Review
    const handleDelete = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            await axiosInstance.delete(`/review/delete/${reviewId}`);
            setReviews(reviews.filter(review => review._id !== reviewId));
        } catch (error) {
            console.error("❌ Error deleting review:", error.response?.data || error.message);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Reviews</h1>

            {loading && <p>Loading reviews...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {reviews.length === 0 ? (
                <p className="text-gray-500">No reviews found.</p>
            ) : (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <table className="w-full border border-gray-300 shadow-md">
                        <thead>
                            <tr className="bg-gray-700 text-white">
                                <th className="p-3 text-left">User</th>
                                <th className="p-3 text-left">Car</th>
                                <th className="p-3 text-left">Review</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review._id} className="border-b">
                                    <td className="p-3">{review.userId?.name || "Anonymous"}</td>
                                    <td className="p-3">{review.carId?.name || "Unknown Car"}</td>
                                    <td className="p-3">
                                        {editingReview === review._id ? (
                                            <input
                                                type="text"
                                                value={editedText}
                                                onChange={(e) => setEditedText(e.target.value)}
                                                className="w-full p-2 border rounded"
                                            />
                                        ) : (
                                            review.reviewText
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {editingReview === review._id ? (
                                            <button
                                                className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                                                onClick={() => handleUpdate(review._id)}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                                onClick={() => handleEdit(review)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                            onClick={() => handleDelete(review._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageReviews;
