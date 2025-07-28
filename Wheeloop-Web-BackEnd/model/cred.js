const mongoose = require("mongoose");

const credSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "customer"],
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    profilePicture: { type: String },
    createdAt: {
        type: Date,
        default: Date.now
    },
    failed_login_attempts: {
        type: Number,
        default: 0
    },
    lockout_until: {
        type: Date,
        default: null
    },
    // --- UPDATED: isVerified remains, but will be set true upon creation in verifyEmail ---
    isVerified: {
        type: Boolean,
        default: true // Default to true now, as user is only created AFTER verification
    }
    // --- END UPDATED ---
});

const Cred = mongoose.model("Cred", credSchema);

module.exports = Cred;