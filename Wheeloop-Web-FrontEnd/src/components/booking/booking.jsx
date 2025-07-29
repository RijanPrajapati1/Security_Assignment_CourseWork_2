import { useEffect, useState } from "react";

import Navbar from "../navBar/navbar";
import axiosInstance from "../utils/axios";

// Function to fetch bookings for the logged-in user
const fetchBookings = async (userId) => {
    try {
        const response = await axiosInstance.get(`/rental/userBookings?userId=${userId}`);
        return response.data || []; // Ensure it's an array
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return []; // Return an empty array on error
    }
};

const Booking = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCarId, setSelectedCarId] = useState(null);

    // Retrieve the userId from localStorage
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) {
            setError("User is not logged in");
            setLoading(false);
            return;
        }

        const getBookings = async () => {
            try {
                setLoading(true);
                const fetchedBookings = await fetchBookings(userId);


                setBookings((prevBookings) =>
                    JSON.stringify(prevBookings) !== JSON.stringify(fetchedBookings) ? fetchedBookings : prevBookings
                );
            } catch (error) {
                setError("Failed to load bookings. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        getBookings();
    }, [userId]);

    // Function to handle click and display carId
    const handleBookingClick = (carId) => {
        setSelectedCarId(carId);
    };

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold text-black mb-4">Your Bookings</h1>

                {loading && <p className="loading-text">Loading your bookings...</p>}
                {error && <p className="error-text">Error: {error}</p>}

                <div className="bg-white p-4 rounded-lg shadow-md">
                    {bookings.length === 0 ? (
                        <p className="no-bookings text-center">No bookings found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border border-black shadow-md rounded-lg">
                                <thead>
                                    <tr className="bg-purple-700 text-white">
                                        <th className="p-3 text-left">#</th>
                                        <th className="p-3 text-left">Car Image</th>
                                        <th className="p-3 text-left">Car Name</th>
                                        <th className="p-3 text-left">Pick-up Location</th>
                                        <th className="p-3 text-left">Start Date</th>
                                        <th className="p-3 text-left">End Date</th>
                                        <th className="p-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, index) => {

                                        let carImage = "/default-car.jpg";
                                        if (booking.carId?.image) {
                                            carImage = booking.carId.image.startsWith("https")
                                                ? booking.carId.image
                                                : `https://localhost:3001/car_images/${booking.carId.image}`;
                                        }

                                        return (
                                            <tr key={booking._id} className="border-b hover:bg-gray-200">
                                                <td className="p-3">{index + 1}</td>
                                                <td className="p-3">
                                                    <img
                                                        src={carImage}
                                                        alt={booking.carId?.name || "Car"}
                                                        className="w-24 h-16 object-cover rounded-md border"
                                                        onError={(e) => {
                                                            e.target.src = "/default-car.jpg";
                                                            e.target.onerror = null;
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-3">{booking.carId?.name || "N/A"}</td>
                                                <td className="p-3">{booking.pickUpLocation}</td>
                                                <td className="p-3">{new Date(booking.startDate).toLocaleDateString()}</td>
                                                <td className="p-3">{new Date(booking.endDate).toLocaleDateString()}</td>
                                                <td className="p-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                                                        ${booking.status === "pending" ? "bg-yellow-200 text-yellow-800" :
                                                            booking.status === "confirmed" ? "bg-green-200 text-green-800" :
                                                                "bg-red-200 text-red-800"}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Display selected Car ID when a booking is clicked */}
                {selectedCarId && (
                    <div className="car-id-display mt-4">
                        <p className="text-black font-bold"><strong>Selected Car ID:</strong> {selectedCarId}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Booking;
