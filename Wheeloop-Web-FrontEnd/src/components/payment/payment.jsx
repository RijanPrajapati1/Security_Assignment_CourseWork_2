import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


import Navbar from "../Navbar/navbar";
import axiosInstance from "../utils/axios";

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingId = localStorage.getItem("bookingId");

    // Extract booking details from navigation state
    const {
        carId,
        carName,
        pricePerDay,
        rentalDays,
        driverDays,
        pickUpLocation,
        startDate,
        endDate
    } = location.state || {};

    // Keep totalAmount calculation exactly as it was before
    const driverCost = driverDays * 500 * rentalDays; // Rs.500 per driver per day
    const totalAmount = rentalDays * pricePerDay + driverCost;

    // State for payment method
    const [paymentMethod, setPaymentMethod] = useState("card");

    // State for card details (only needed for card payments)
    const [cardDetails, setCardDetails] = useState({
        cardHolder: "",
        cardNumber: "",
        expiryDate: "",
        cvv: ""
    });

    // State for PayPal transaction ID
    const [transactionId, setTransactionId] = useState("");

    const [loading, setLoading] = useState(false);



    const handleInputChange = (e) => {
        setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userId = localStorage.getItem("userId");

            //  Validate payment method before proceeding
            if (paymentMethod === "card" && (!cardDetails.cardHolder || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv)) {
                alert("Please fill in all card details.");
                setLoading(false);
                return;
            }
            if (paymentMethod === "paypal" && !transactionId) {
                alert("Please enter a valid PayPal transaction ID.");
                setLoading(false);
                return;
            }

            //  Payment and booking details (Added bookingId)
            const paymentData = {
                userId,
                bookingId,  //  Use booking ID from localStorage
                totalAmount,
                paymentMethod,
                transactionId: paymentMethod === "paypal" ? transactionId : null,
                cardDetails: paymentMethod === "card" ? cardDetails : null
            };

            //  Send payment request and update booking status
            const response = await axiosInstance.post("/payment/process", paymentData);

            if (response.status === 201) {
                alert("Payment successful! Booking confirmed.");

                //  Remove bookingId from localStorage after successful payment
                localStorage.removeItem("bookingId");

                navigate("/");
            } else {
                alert("Payment failed! Please try again.");
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            alert("Error: Unable to process payment.");
        }

        setLoading(false);
    };

    return (
        <div>
            <Navbar />
            <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Secure Payment</h1>

                {/* Booking Summary */}
                <div className="bg-white bg-opacity-80 backdrop-blur-lg shadow-lg rounded-lg p-6 w-full max-w-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Booking Summary</h2>
                    <div className="text-gray-700 space-y-2">
                        <p><strong>Car:</strong> {carName}</p>
                        <p><strong>Price Per Day:</strong> Rs.{pricePerDay}</p>
                        <p><strong>Rental Days:</strong> {rentalDays}</p>
                        <p><strong>Driver Days:</strong> {driverDays} (Extra Cost: Rs.{driverCost})</p>
                        <p><strong>Pick-Up Location:</strong> {pickUpLocation}</p>
                        <p><strong>Start Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(endDate).toLocaleDateString()}</p>
                        <p className="text-xl font-bold mt-3 text-green-600">Total Amount: Rs.{totalAmount}</p>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="bg-white bg-opacity-80 backdrop-blur-lg shadow-lg rounded-lg p-6 w-full max-w-lg mt-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Choose Payment Method</h2>
                    <form onSubmit={handlePayment}>

                        {/* Payment Method Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={handlePaymentMethodChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                            >
                                <option value="card">Credit/Debit Card</option>
                                <option value="paypal">PayPal</option>
                                <option value="cash">Cash on Delivery</option>
                            </select>
                        </div>

                        {/* Card Details - Only if Card is Selected */}
                        {paymentMethod === "card" && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Card Holder Name</label>
                                    <input
                                        type="text"
                                        name="cardHolder"
                                        value={cardDetails.cardHolder}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Card Number</label>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={cardDetails.cardNumber}
                                        onChange={handleInputChange}
                                        maxLength="16"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                    />
                                </div>

                                <div className="flex mb-4 space-x-4">
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            value={cardDetails.expiryDate}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* PayPal Transaction ID Field */}
                        {paymentMethod === "paypal" && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">PayPal Transaction ID</label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                />
                            </div>
                        )}

                        <button type="submit" className="w-full px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold focus:outline-none transition duration-300" disabled={loading}>
                            {loading ? "Processing..." : "Pay & Confirm Booking"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Payment;
