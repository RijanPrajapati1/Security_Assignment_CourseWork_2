// backend/controllers/payment_controller.js

const Rental = require("../model/rental");
const Payment = require("../model/payment");

const axios = require('axios'); // Import axios for CAPTCHA verification

// !!! WARNING: HARDCODING SECRET KEY - DO NOT DO THIS IN PRODUCTION !!!
// For debugging purposes, directly insert your reCAPTCHA Secret Key here.
// Once confirmed working, revert this to process.env.GOOGLE_RECAPTCHA_SECRET_KEY
// and fix your .env loading issue.
const RECAPTCHA_SECRET_KEY = "6LdrPpMrAAAAAASM07eb9uZskFLFqLG3CbVca_MF"; // <--- HARDCODED SECRET KEY HERE

// Process Payment
const processPayment = async (req, res) => {
    try {
        const {
            bookingId,
            userId,
            totalAmount,
            paymentMethod,
            transactionId,
            cardNumber, // If using mock card details directly
            expiryDate, // If using mock card details directly
            cardHolderName, // If using mock card details directly
            cardDetails, // If frontend sends cardDetails as an object
            captchaValue // Destructure captchaValue from request body
        } = req.body;

        // --- START: CRITICAL CAPTCHA Verification Step ---
        if (!RECAPTCHA_SECRET_KEY) {
            // This 'if' block should ideally not be hit if key is hardcoded.
            // But it's good to keep for a quick check.
            console.error("RECAPTCHA_SECRET_KEY is missing (even when hardcoded - critical error!)");
            return res.status(500).json({ message: "Server configuration error: CAPTCHA key missing unexpectedly." });
        }

        if (!captchaValue) {
            return res.status(400).json({ message: "CAPTCHA token is missing. Please complete the CAPTCHA." });
        }

        try {
            const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaValue}`;
            const recaptchaResponse = await axios.post(verificationURL);

            const { success, 'error-codes': errorCodes } = recaptchaResponse.data;

            if (!success) {
                console.error("reCAPTCHA verification failed:", errorCodes);
                // Inform user about CAPTCHA failure
                return res.status(401).json({ message: 'CAPTCHA verification failed. Please try again.' });
            }

        } catch (captchaError) {
            console.error("Error during reCAPTCHA verification request:", captchaError.message);
            return res.status(500).json({ message: 'Internal server error during CAPTCHA verification.' });
        }
        // --- END: CRITICAL CAPTCHA Verification Step ---


        // Validate if the booking exists
        const existingBooking = await Rental.findById(bookingId);
        if (!existingBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Validate required fields based on payment method
        if (paymentMethod === "card") {
            if (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cardHolderName) {
                return res.status(400).json({ message: "Card details (number, expiry, holder name) are required for card payments." });
            }
        } else if (paymentMethod !== "cash" && !transactionId) {
            return res.status(400).json({ message: "Transaction ID is required for online payments" });
        }

        // Mask card number for security (store only last 4 digits)
        let maskedCardNumber = null;
        if (paymentMethod === "card" && cardDetails && cardDetails.cardNumber) {
            maskedCardNumber = cardDetails.cardNumber.slice(-4);
        }

        // Set payment status based on method
        let paymentStatus = paymentMethod === "cash" ? "pending" : "completed";
        if (paymentMethod !== "cash" && !transactionId) {
            paymentStatus = "failed"; // If it's online but no transaction ID
        }


        // Process and save payment
        const newPayment = new Payment({
            bookingId,
            userId,
            totalAmount,
            paymentMethod,
            transactionId: paymentMethod === "cash" ? null : transactionId,
            paymentStatus,
            cardDetails: paymentMethod === "card"
                ? {
                    cardNumber: maskedCardNumber,
                    expiryDate: cardDetails.expiryDate,
                    cardHolderName: cardDetails.cardHolderName
                }
                : undefined
        });

        await newPayment.save();

        res.status(201).json({
            message: "Payment processed successfully.",
            payment: newPayment
        });
    } catch (error) {
        console.error("❌ Payment processing error:", error);
        res.status(500).json({ message: "Payment failed!", error: error.message });
    }
};

// --- (Rest of your controller functions remain the same) ---
const fetchAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate("userId bookingId");
        if (!payments.length) {
            return res.status(404).json({ message: "No payments found." });
        }
        res.status(200).json({ success: true, payments });
    } catch (error) {
        console.error("❌ Error fetching all payments:", error);
        res.status(500).json({ message: "Failed to fetch payments." });
    }
};

const fetchPaymentsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const payments = await Payment.find({ userId }).populate("bookingId");
        if (!payments.length) {
            return res.status(404).json({ message: "No payments found for this user." });
        }
        res.status(200).json({ success: true, payments });
    } catch (error) {
        console.error("❌ Error fetching user payments:", error);
        res.status(500).json({ message: "Failed to fetch user payments." });
    }
};

const fetchPaymentsByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const payment = await Payment.findOne({ bookingId }).populate("userId");
        if (!payment) {
            return res.status(404).json({ message: "No payment found for this booking." });
        }
        res.status(200).json({ success: true, payment });
    } catch (error) {
        console.error("❌ Error fetching booking payment:", error);
        res.status(500).json({ message: "Failed to fetch booking payment." });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { paymentStatus } = req.body;

        const updatedPayment = await Payment.findByIdAndUpdate(paymentId, { paymentStatus }, { new: true });

        if (!updatedPayment) {
            return res.status(404).json({ message: "Payment not found." });
        }

        res.status(200).json({ success: true, message: "Payment status updated.", updatedPayment });
    } catch (error) {
        console.error("❌ Error updating payment status:", error);
        res.status(500).json({ message: "Failed to update payment status." });
    }
};

const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const deletedPayment = await Payment.findByIdAndDelete(paymentId);

        if (!deletedPayment) {
            return res.status(404).json({ message: "Payment not found." });
        }

        res.status(200).json({ success: true, message: "Payment deleted successfully." });
    } catch (error) {
        console.error("❌ Error deleting payment:", error);
        res.status(500).json({ message: "Failed to delete payment." });
    }
};

module.exports = {
    processPayment,
    fetchAllPayments,
    fetchPaymentsByUser,
    fetchPaymentsByBooking,
    updatePaymentStatus,
    deletePayment
};