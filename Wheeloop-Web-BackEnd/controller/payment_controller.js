const Rental = require("../model/rental");
const Payment = require("../model/payment");

// Process Payment
const processPayment = async (req, res) => {
    try {
        const { bookingId, userId, totalAmount, paymentMethod, transactionId, cardNumber, expiryDate, cardHolderName } = req.body;

        // Validate if the booking exists
        const existingBooking = await Rental.findById(bookingId);
        if (!existingBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Validate required fields based on payment method
        if (paymentMethod === "card" && (!transactionId || !cardNumber || !expiryDate || !cardHolderName)) {
            return res.status(400).json({ message: "Card details and transaction ID are required for card payments." });
        } else if (paymentMethod !== "cash" && !transactionId) {
            return res.status(400).json({ message: "Transaction ID is required for online payments" });
        }

        // Mask card number for security (store only last 4 digits)
        let maskedCardNumber = null;
        if (paymentMethod === "card") {
            maskedCardNumber = cardNumber.slice(-4);
        }

        // Set payment status based on method
        let paymentStatus = paymentMethod === "cash" ? "pending" : transactionId ? "completed" : "failed";

        // rocess and save payment
        const newPayment = new Payment({
            bookingId,
            userId,
            totalAmount,
            paymentMethod,
            transactionId: paymentMethod === "cash" ? null : transactionId,
            paymentStatus,
            cardDetails: paymentMethod === "card"
                ? { cardNumber: maskedCardNumber, expiryDate, cardHolderName }
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

// Fetch All Payments (Admin Only)
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

// Fetch Payment by User ID
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

// Fetch Payment by Booking ID
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

// Update Payment Status (Admin Only)
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

// Delete Payment (Admin Only)
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
