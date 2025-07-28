// src/model/cred.js

const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const credSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        // *** CHANGE THIS LINE ***
        required: false, // <--- Make it false initially
        minlength: [12, 'Password must be at least 12 characters long'],
        maxlength: [64, 'Password cannot exceed 64 characters'],
        select: false
    },
    tempPassword: {
        type: String,
        select: false
    },
    role: {
        type: String,
        enum: ["admin", "customer"],
        required: true,
        default: 'customer'
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
    isVerified: {
        type: Boolean,
        default: false
    },
    mfaEnabled: {
        type: Boolean,
        default: false
    },
    mfaOtp: String,
    mfaOtpExpires: Date
}, { timestamps: true });

credSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Cred = mongoose.model("Cred", credSchema);

module.exports = Cred;