const express = require("express");
const {
    processPayment,
    fetchAllPayments,
    fetchPaymentsByUser,
    fetchPaymentsByBooking,
    updatePaymentStatus,
    deletePayment
} = require("../controller/payment_controller");


const router = express.Router();

// Process Payment
router.post("/process", processPayment);

// Fetch All Payments (Admin Only)
router.get("/fetchAll", fetchAllPayments);

// etch Payment by User ID
router.get("/user/:userId", fetchPaymentsByUser);

//Fetch Payment by Booking ID
router.get("/booking/:bookingId", fetchPaymentsByBooking);

// pdate Payment Status (Admin Only)
router.put("/update/:paymentId", updatePaymentStatus);

// Delete Payment (Admin Only)
router.delete("/delete/:paymentId", deletePayment);

module.exports = router;
