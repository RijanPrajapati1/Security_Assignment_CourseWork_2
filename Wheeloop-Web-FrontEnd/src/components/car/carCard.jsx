import { useEffect, useState } from "react";
import { FaCogs, FaRoad, FaUser } from "react-icons/fa";

import { useNavigate } from "react-router-dom";


import Navbar from "../navBar/navbar";
import axiosInstance from "../utils/axios";



const CarCard = ({ car, onCardClick }) => (
    <div
        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={() => onCardClick(car)}
    >
        <div className="flex justify-center">
            <img
                src={car.image}
                alt={car.name}
                className="w-full h-48 object-contain rounded-xl"
                onError={(e) => { e.target.src = "/placeholder-image.jpg"; }}
            />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mt-4 truncate">{car.name}</h2>
        <p className="text-sm text-gray-500 mb-4">{car.type}</p>
        <div className="flex justify-between items-center text-sm text-gray-700 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2">
                <FaUser className="text-gray-600" />
                <p>{car.capacity} 4 People</p>
            </div>
            <div className="flex items-center gap-2">
                <FaCogs className="text-gray-600" />
                <p>{car.transmission}</p>
            </div>
            <div className="flex items-center gap-2">
                <FaRoad className="text-gray-600" />
                <p>{car.mileage} 20 miles/day</p>
            </div>
        </div>
        <div className="mt-6 flex justify-between items-center">
            <p className="text-lg font-bold text-green-600">Rs.{car.price}/day</p>
            <button
                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition duration-300"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event
                    onCardClick(car); // Open the car details modal
                }}
            >
                View Details
            </button>
        </div>
    </div>
);

const CarListing = () => {
    const [cars, setCars] = useState([]); // state to hold car data
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCar, setSelectedCar] = useState(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const navigate = useNavigate(); // useNavigate for navigation
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        pickUpLocation: "",
        startDate: "",
        endDate: "",
        status: "",
        driverDays: 0,
    });

    //  Added Review Section: Review state variables
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");



    // Fetch cars data from backend
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await axiosInstance.get("/car/findAll"); // Adjust endpoint if necessary
                setCars(response.data); // Set the cars data to state
            } catch (error) {
                console.error("Error fetching cars", error);
            }
        };

        fetchCars();
    }, []);

    // Handle search term change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Filter users based on search term
    const filteredCars = cars.filter(
        (car) =>
            (car.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (car.type?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        const bookingData = {
            userId,
            carId: selectedCar?._id,
            pickUpLocation: formData.pickUpLocation,
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: "pending",
            driverDays: formData.driverDays,
        };

        try {
            console.log("📤 Sending booking request:", bookingData);

            const response = await axiosInstance.post("/rental", bookingData);

            console.log("📥 Booking API Response:", response);
            console.log("📥 Response Data:", response.data);

            const bookingId = response.data?.bookingId || response.data?._id;

            if (!bookingId) {
                console.error("🚨 Booking ID not received from the server!", response.data);
                alert("Booking ID not received from the server!");
                return;
            }

            //  Store booking ID in localStorage
            localStorage.setItem("bookingId", bookingId);
            console.log(" Stored bookingId in localStorage:", localStorage.getItem("bookingId"));

            setShowBookingForm(false);
            setSelectedCar(null);

            navigate("/payment", {
                state: {
                    bookingId, //  Pass correct bookingId
                    carId: selectedCar?._id,
                    carName: selectedCar?.name,
                    pricePerDay: selectedCar?.price,
                    rentalDays: calculateDays(formData.startDate, formData.endDate),
                    driverDays: formData.driverDays,
                    pickUpLocation: formData.pickUpLocation,
                    startDate: formData.startDate,
                    endDate: formData.endDate
                }
            });

        } catch (error) {
            console.error("❌ Error submitting booking:", error.response?.data || error.message);
            alert("Failed to book the car. Please try again.");
        }
    };

    // Helper function to calculate total rental days
    const calculateDays = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    };


    const handleBookClick = () => {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("You need to log in to book a car.");
            return;
        }

        setShowBookingForm(true);
    };


    //  Fetch Reviews When Car is Selected
    useEffect(() => {
        if (selectedCar) {
            fetchReviews(selectedCar._id);
        }
    }, [selectedCar]);

    //  Function to Fetch Reviews for Selected Car
    const fetchReviews = async (carId) => {
        try {
            setReviews([]); //  Reset reviews before fetching new ones
            const response = await axiosInstance.get(`/review/car/${carId}`);
            setReviews(response.data.reviews || []);
        } catch (error) {
            console.error("❌ Error fetching reviews:", error.response?.data || error.message);
            setReviews([]);
        }
    };

    //  Submit a Review (Fixed)
    const handleReviewSubmit = async () => {
        if (!newReview.trim()) return;

        const userId = localStorage.getItem("userId"); // Retrieve userId inside the function

        if (!userId) {
            alert("Please log in or sign up to submit a review.");
            return;
        }

        try {
            await axiosInstance.post("/review/submit", {
                userId,
                carId: selectedCar._id,
                reviewText: newReview
            });

            setNewReview(""); //  Clear input field
            fetchReviews(selectedCar._id); // Fetch updated reviews
        } catch (error) {
            console.error("❌ Error submitting review:", error.response?.data || error.message);
            alert("Failed to submit review. Please try again.");
        }
    };



    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mb-8">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search for cars..."
                        className="w-full px-5 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                </div>

                {/* Car Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCars.map((car, index) => (
                        <CarCard key={index} car={car} onCardClick={setSelectedCar} />
                    ))}
                </div>

                {/* Car Details and Book Now Modal */}
                {selectedCar && (
                    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-[700px] relative">
                            <button
                                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                                onClick={() => setSelectedCar(null)}
                            >
                                ✖
                            </button>
                            <h3 className="text-2xl font-semibold mb-4">{selectedCar.name}</h3>
                            <div className="flex overflow-x-auto gap-2 mb-4">
                                <img
                                    src={selectedCar.image}
                                    alt={selectedCar.name}
                                    className="w-40 h-24 rounded-lg object-cover"
                                    onError={(e) => { e.target.src = "/placeholder-image.jpg"; }}  // Optional fallback image
                                />

                            </div>
                            <p className="text-gray-700 mb-2"><strong>Type:</strong> {selectedCar.type}</p>
                            <p className="text-gray-700 mb-2"><strong>Capacity:</strong> {selectedCar.capacity}4 People</p>
                            <p className="text-gray-700 mb-2"><strong>Transmission:</strong> {selectedCar.transmission}</p>
                            <p className="text-gray-700 mb-2"><strong>Mileage:</strong> {selectedCar.mileage}20 miles/day</p>
                            <p className="text-gray-700 mb-2"><strong>Price:</strong> Rs.{selectedCar.price}/day</p>
                            <p className="text-gray-600 mb-6">{selectedCar.description}</p>
                            {/*  Added Review Section: Display reviews */}
                            <h4 className="text-xl font-semibold mt-6">Reviews</h4>
                            <div className="bg-gray-100 p-4 rounded-md h-48 overflow-y-auto">
                                {reviews.length > 0 ? (
                                    reviews.map((review, index) => (
                                        <div key={index} className="border-b py-2">
                                            <p className="text-sm font-semibold">{review.userId.name || "Anonymous"}:</p>
                                            <p className="text-sm text-gray-700">{review.reviewText}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600">No reviews yet.</p>
                                )}
                            </div>

                            {/*  Added Review Section: Input box for submitting a review */}
                            <textarea
                                className="w-full mt-4 p-3 border rounded-md"
                                placeholder="Write a review..."
                                value={newReview}
                                onChange={(e) => setNewReview(e.target.value)}
                            ></textarea>
                            <button className="bg-blue-600 text-white px-4 py-2 mt-3 rounded-md" onClick={handleReviewSubmit}>
                                Submit Review
                            </button>

                            <div className="flex justify-end">
                                <button
                                    className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition duration-300"
                                    onClick={handleBookClick}
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Booking Form Modal */}
                {showBookingForm && (
                    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-[700px] relative">
                            <h3 className="text-2xl font-semibold mb-4">Book {selectedCar?.name}</h3>

                            {/* Car Information Display */}
                            <div className="mb-4">
                                <p><strong>Car:</strong> {selectedCar?.name}</p>
                                <p><strong>Price:</strong> Rs.{selectedCar?.price}/day</p>
                            </div>

                            <form onSubmit={handleFormSubmit}>
                                {/* Name */}
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>

                                {/* Contact */}
                                <div className="mb-4">
                                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
                                    <input
                                        type="text"
                                        id="contact"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>

                                {/* Pick-Up Location */}
                                <div className="mb-4">
                                    <label htmlFor="pickUpLocation" className="block text-sm font-medium text-gray-700">Pick-Up Location</label>
                                    <input
                                        type="text"
                                        id="pickUpLocation"
                                        name="pickUpLocation"
                                        value={formData.pickUpLocation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>

                                {/* Start Date */}
                                <div className="mb-4">
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        min={new Date().toISOString().split("T")[0]} // Restrict past dates
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                                        required
                                    />
                                </div>

                                {/* End Date */}
                                <div className="mb-4">
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        min={formData.startDate || new Date().toISOString().split("T")[0]} // End date must be after Start Date
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                                        required
                                    />
                                </div>

                                {/* Driver Days */}
                                <div className="mb-4">
                                    <label htmlFor="driverDays per day=500" className="block text-sm font-medium text-gray-700">Driver Days : Per Day:Rs. 500</label>
                                    <input
                                        type="number"
                                        id="driverDays"
                                        name="driverDays"
                                        value={formData.driverDays}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        required
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        type="submit"
                                        className="bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition duration-300"
                                    >
                                        Go to Payment
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-gray-600 text-white px-5 py-2 rounded-full hover:bg-gray-700 transition duration-300"
                                        onClick={() => setShowBookingForm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarListing;
