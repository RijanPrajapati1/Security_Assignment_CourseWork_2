import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../navBar/navbar";
import axiosInstance from "../utils/axios";

// Removed react-toastify imports
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingId = localStorage.getItem("bookingId");
    const userId = localStorage.getItem("userId"); // Ensure userId is available

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
    const driverCost = driverDays * 500 * rentalDays;
    const totalAmount = rentalDays * pricePerDay + driverCost;

    // State for payment method - Defaulting to "card" as requested
    const [paymentMethod, setPaymentMethod] = useState("card");

    // State for card details (used ONLY for the insecure mock/demo 'card' method)
    const [cardDetails, setCardDetails] = useState({
        cardHolder: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "" // CVV is now masked in the input field
    });

    // State for PayPal transaction ID
    const [transactionId, setTransactionId] = useState("");

    const [loading, setLoading] = useState(false);

    // Handles input changes for card details
    const handleInputChange = (e) => {
        setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
        // Clear inputs when method changes
        setCardDetails({ cardHolder: "", cardNumber: "", expiryDate: "", cvv: "" });
        setTransactionId("");
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Essential validation before proceeding
            if (!bookingId || !userId || totalAmount <= 0) {
                alert("Missing essential booking details. Please go back to booking."); // Reverted to alert
                navigate('/Booking');
                return;
            }

            // --- Frontend Validation based on selected method ---
            if (paymentMethod === "card") {
                // --- CRITICAL SECURITY WARNING: This code is for MOCK/DEMO ONLY ---
                // Direct collection of card details is INSECURE and NOT PCI COMPLIANT.
                alert("SECURITY WARNING: This 'Credit/Debit Card' option is for **mocking/demonstration ONLY**. It is **INSECURE** for real payments and violates PCI DSS."); // Reverted to alert

                if (!cardDetails.cardHolder || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
                    alert("Please fill in all card details for the mock payment."); // Reverted to alert
                    setLoading(false);
                    return;
                }
                if (!/^\d{13,19}$/.test(cardDetails.cardNumber)) { // Cards can be 13-19 digits
                    alert("Card number must be 13-19 digits (mock)."); // Reverted to alert
                    setLoading(false);
                    return;
                }
                if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
                    alert("Expiry date format must be MM/YY (mock)."); // Reverted to alert
                    setLoading(false);
                    return;
                }
                if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
                    alert("CVV must be 3 or 4 digits (mock)."); // Reverted to alert
                    setLoading(false);
                    return;
                }
            } else if (paymentMethod === "paypal" && !transactionId) {
                alert("Please enter a valid PayPal transaction ID."); // Reverted to alert
                setLoading(false);
                return;
            }
            // No specific frontend validation for 'cash'

            // Prepare payment data to send to backend
            const paymentData = {
                userId,
                bookingId,
                totalAmount,
                paymentMethod,
                // transactionId is used for PayPal and optional for Card mock
                transactionId: (paymentMethod === "paypal" || paymentMethod === "card") ? transactionId : null,
                // CardDetails sent ONLY if 'card' method selected, for mock purposes
                cardDetails: paymentMethod === "card" ? cardDetails : undefined // Send cardDetails for mock card
            };

            // Send payment request to backend's central processing endpoint
            const response = await axiosInstance.post("/payment/process", paymentData);

            if (response.status === 201) {
                alert("Payment initiated! Booking confirmed."); // Reverted to alert
                localStorage.removeItem("bookingId"); // Clear bookingId from storage
                navigate("/"); // Redirect to home or bookings list
            } else {
                alert("Payment failed! Please try again."); // Reverted to alert
            }
        } catch (error) {
            console.error("Error processing payment:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Error: Unable to process payment."); // Reverted to alert
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            {/* Removed ToastContainer */}
            <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Secure Payment</h1>

                {/* Booking Summary */}
                <div className="bg-white bg-opacity-80 backdrop-blur-lg shadow-lg rounded-lg p-6 w-full max-w-lg mb-6">
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
                                <option value="card">Credit/Debit Card (MOCK - INSECURE)</option>
                                <option value="paypal">PayPal</option>
                                <option value="cash">Cash on Delivery</option>
                            </select>
                        </div>

                        {/* Card Details - Only if "card" is Selected */}
                        {paymentMethod === "card" && (
                            <>
                                {/* WARNING MESSAGE FOR INSECURE CARD INPUT */}
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                    <p className="font-bold">WARNING: INSECURE PAYMENT METHOD!</p>
                                    <p className="text-sm">This option is for **mocking/demonstration ONLY**. It directly collects sensitive card data which is **NOT secure or PCI Compliant** for real transactions.</p>
                                    <p className="text-sm mt-1">For real card payments, use a PCI-compliant payment gateway (e.g., Stripe) that tokenizes card data.</p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Card Holder Name</label>
                                    <input
                                        type="text"
                                        name="cardHolder"
                                        value={cardDetails.cardHolder}
                                        onChange={handleInputChange}
                                        required={paymentMethod === "card"}
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
                                        maxLength="16" // Basic max length
                                        pattern="\d{13,19}" // Pattern for 13-19 digits
                                        title="Please enter a valid card number (13-19 digits)"
                                        required={paymentMethod === "card"}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                    />
                                </div>

                                <div className="flex mb-4 space-x-4">
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-700">Expiry Date (MM/YY)</label>
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            value={cardDetails.expiryDate}
                                            onChange={handleInputChange}
                                            placeholder="MM/YY"
                                            pattern="(0[1-9]|1[0-2])\/\d{2}" // Pattern for MM/YY
                                            title="Please enter expiry date in MM/YY format"
                                            required={paymentMethod === "card"}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-700">CVV</label>
                                        <input
                                            type="password" // Changed to type="password" to mask input
                                            name="cvv"
                                            value={cardDetails.cvv}
                                            onChange={handleInputChange}
                                            maxLength="4" // Max length for CVV
                                            pattern="\d{3,4}" // Pattern for 3 or 4 digits
                                            title="Please enter a 3 or 4 digit CVV"
                                            required={paymentMethod === "card"}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Mock Transaction ID (Optional)</label>
                                    <input
                                        type="text"
                                        name="transactionId"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        placeholder="Optional: Enter a mock transaction ID"
                                    />
                                </div>
                            </>
                        )}

                        {/* PayPal Transaction ID Field */}
                        {paymentMethod === "paypal" && (
                            <div className="mb-4">
                                <p className="text-sm text-green-700 mb-2">
                                    **PayPal Payment Instructions:**<br />
                                    1. Please transfer **Rs.{totalAmount}** to our PayPal account: <strong>your.paypal.email@example.com</strong><br />
                                    2. After completing the payment on PayPal, copy the unique Transaction ID.<br />
                                    3. Paste the PayPal Transaction ID below for us to verify your payment.
                                </p>
                                <label className="block text-sm font-medium text-gray-700">PayPal Transaction ID</label>
                                <input
                                    type="text" // This should remain type="text" as it's a reference ID
                                    name="transactionId"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    required={paymentMethod === "paypal"}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                    placeholder="e.g., ABC-12345678-XYZ"
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