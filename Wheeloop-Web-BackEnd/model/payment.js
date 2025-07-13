const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "rentals",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cred",
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["card", "paypal", "cash"],
        required: true
    },
    transactionId: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    cardDetails: {
        cardNumber: { type: String, default: null }, // Store last 4 digits only
        expiryDate: { type: String, default: null }, // Format: MM/YY
        cardHolderName: { type: String, default: null }
    }
});

const Payment = mongoose.model("payments", paymentSchema);

module.exports = Payment;
