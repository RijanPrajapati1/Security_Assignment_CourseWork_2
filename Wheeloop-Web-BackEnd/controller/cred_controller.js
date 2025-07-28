const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Cred = require("../model/cred");

// Import the new password validation function
const passwordPolicy = require('../validation/password_validation');

// --- NEW: Security Constants ---
const SECRET_KEY = "8261ba19898d0dcdfe6c0c411df74b587b2e54538f5f451633b71e39f957cf01";
const ObjectId = mongoose.Types.ObjectId;

// Brute-force prevention settings
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_TIME_MINUTES = 5;
// --- END NEW ---

// Register Controller - UPDATED
// Register Controller - UPDATED for Email Verification
// Register Controller - REVISED for pre-registration email verification
const register = async (req, res) => {
    console.log("Register request received (pre-verification)", req.body);
    const { email, password, full_name, address, phone_number } = req.body;

    // Password Policy Check (as before)
    const validationResult = passwordPolicy(password);
    if (!validationResult.valid) {
        console.log("Registration failed: Password does not meet policy", email);
        return res.status(400).send(validationResult.message);
    }

    // IMPORTANT: Check if email already exists BEFORE sending verification email
    // This prevents sending emails to already registered users
    const existingCred = await Cred.findOne({ email });
    if (existingCred) {
        console.log("Registration failed: Email already registered", email);
        return res.status(400).send("Email already registered. Please login.");
    }

    // Hash the password *now* to include in the JWT payload
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- NEW: Create a JWT containing all user data for later creation ---
    // This JWT payload will contain all necessary data to create the user after verification
    const userDataForVerification = {
        email,
        password: hashedPassword, // Store hashed password
        full_name,
        address,
        phone_number,
        role: "customer", // Default role
        // No isVerified: true here, it's implied upon successful processing of this token
    };

    // Sign the JWT with user data. Expire in 1 minute.
    const verificationToken = jwt.sign(userDataForVerification, SECRET_KEY, { expiresIn: '1m' });
    // --- END NEW ---

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "rijanpraz@gmail.com",
                pass: "hnbyxbgpqqtrwkci"
            }
        });

        // IMPORTANT: Replace 'http://localhost:5173' with your actual frontend URL
        const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;

        const info = await transporter.sendMail({
            from: "rijanpraz@gmail.com",
            to: email, // Send to the provided email
            subject: "Verify Your Email Address - Wheeloop Car Rental",
            html: `
                <h1>Welcome to Wheeloop, ${full_name}!</h1>
                <p>Thank you for your interest in registering. Please click the link below to verify your email address and complete your registration:</p>
                <p><a href="${verificationLink}">Verify Email Address</a></p>
                <p>This link is valid for <strong>1 minute</strong>.</p>
                <p>If you did not attempt to register for this account, please ignore this email.</p>
            `
        });

        console.log("Verification email sent successfully to", email);
        // Respond to frontend, indicating email sent for verification
        res.status(200).send({ message: "Registration initiated! Please check your email to verify your account within 1 minute. Your account will be created upon verification." });

    } catch (e) {
        console.error("Error during pre-registration email sending", e);
        res.status(500).json(e);
    }
};


// Verify Email Controller - UPDATED
// Verify Email Controller - REVISED (Now creates the user)
const verifyEmail = async (req, res) => {
    console.log("Email verification request received", req.query);
    const { token } = req.query;

    try {
        // Verify the JWT token. This will throw an error if expired or invalid.
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("Decoded token for verification", decoded);

        // Extract user data from the decoded token
        const { email, password, full_name, address, phone_number, role } = decoded;

        // --- NEW: Check if the user already exists (e.g., if they refreshed the link or tried to verify twice) ---
        const existingCred = await Cred.findOne({ email });
        if (existingCred) {
            if (existingCred.isVerified) {
                console.log("User already verified:", email);
                return res.status(200).send("Email already verified. You can now log in!");
            } else {
                // This case should ideally not happen with the new flow, but good to handle
                console.log("User exists but not verified (unexpected state, perhaps old flow or manual manipulation):", email);
                // Option 1: Update the existing unverified user (if they somehow exist)
                // existingCred.isVerified = true;
                // await existingCred.save();
                // return res.status(200).send("Email verified successfully. You can now log in!");
                // Option 2: Treat as an error if user exists and is not verified (forces re-registration via email)
                return res.status(400).send("A user with this email already exists but is not verified. Please try registering again to get a new link.");
            }
        }

        // --- IMPORTANT: ONLY CREATE THE USER NOW, after successful token verification ---
        const newUser = new Cred({
            email,
            password, // Password is already hashed from the register function
            role,
            full_name,
            address,
            phone_number,
            isVerified: true // Mark as true since verification is successful
        });

        await newUser.save();
        console.log("New user successfully created and verified:", email);

        res.status(200).send("Email verified successfully and account created! You can now log in.");
        // You might want to redirect the user to a success page or login page on the frontend here
    } catch (e) {
        console.error("Email verification error:", e);
        if (e.name === 'TokenExpiredError') {
            return res.status(400).send("Verification link has expired. Please register again to receive a new link.");
        }
        // This could be JsonWebTokenError (invalid signature) or other errors
        res.status(400).send("Invalid or corrupted verification link. Please try registering again.");
    }
};

// Login Controller - UPDATED to check verification status
const login = async (req, res) => {
    console.log("Login request received", req.body);
    const { email, password } = req.body;
    let cred = await Cred.findOne({ email });

    if (!cred) {
        console.log("Login failed: Email not found", email);
        return res.status(403).send('Invalid email or password');
    }

    // --- NEW: Check if email is verified ---
    if (!cred.isVerified) {
        console.log(`Login failed: Email not verified for user ${email}.`);
        return res.status(403).send('Please verify your email address before logging in. Check your inbox for the verification link.');
    }
    // --- END NEW ---

    // Check if the account is currently locked out (already implemented)
    if (cred.lockout_until && cred.lockout_until > new Date()) {
        const remainingMinutes = Math.ceil((cred.lockout_until - new Date()) / (1000 * 60));
        console.log(`Login failed: Account is locked for user ${email}.`);
        return res.status(403).send(`Account is locked. Please try again in ${remainingMinutes} minutes.`);
    }

    const validPassword = await bcrypt.compare(password, cred.password);

    if (!validPassword) {
        console.log("Login failed: Incorrect password", email);

        // Countdown logic (already implemented)
        cred.failed_login_attempts += 1;
        await cred.save();

        const remainingAttempts = MAX_FAILED_ATTEMPTS - cred.failed_login_attempts;
        if (remainingAttempts > 0) {
            return res.status(403).send(`Invalid email or password. You have ${remainingAttempts} attempts remaining.`);
        } else {
            cred.lockout_until = new Date(Date.now() + LOCKOUT_TIME_MINUTES * 60 * 1000);
            console.log(`User ${email} has been locked out for ${LOCKOUT_TIME_MINUTES} minutes.`);
            await cred.save();
            return res.status(403).send(`Too many failed login attempts. Your account has been locked for ${LOCKOUT_TIME_MINUTES} minutes.`);
        }
    }

    // On successful login, reset failed attempts and lockout (already implemented)
    if (cred.failed_login_attempts > 0) {
        cred.failed_login_attempts = 0;
        cred.lockout_until = null;
        await cred.save();
    }

    const token = jwt.sign({ email: cred.email, role: cred.role }, SECRET_KEY, { expiresIn: '24h' });
    console.log("Login successful", email);

    res.json({
        token,
        role: cred.role,
        userId: cred._id.toString()
    });
};

// Other CRUD operations - UNCHANGED
const findAll = async (req, res) => {
    try {
        const users = await Cred.find();
        console.log("Retrieved all users", users.length);
        res.status(200).json(users);
    } catch (e) {
        console.error("Error fetching users", e);
        res.status(500).json(e);
    }
};

const findById = async (req, res) => {
    try {
        const userId = new ObjectId(req.params.id);
        const user = await Cred.findById(userId);

        if (!user) {
            console.log("User not found", req.params.id);
            return res.status(404).send("User not found");
        }

        console.log("User retrieved", user);
        res.status(200).json(user);
    } catch (e) {
        console.error("Error fetching user", e);
        res.status(500).json(e);
    }
};

const update = async (req, res) => {
    try {
        const updatedUser = await Cred.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            console.log("User not found for update", req.params.id);
            return res.status(404).send("User not found");
        }
        console.log("User updated successfully", updatedUser);
        res.status(202).json(updatedUser);
    } catch (e) {
        console.error("Error updating user", e);
        res.status(500).json(e);
    }
};

const deleteById = async (req, res) => {
    try {
        const deletedUser = await Cred.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            console.log("User not found for deletion", req.params.id);
            return res.status(404).send("User not found");
        }
        console.log("User deleted successfully", req.params.id);
        res.status(200).send("User deleted");
    } catch (e) {
        console.error("Error deleting user", e);
        res.status(500).json(e);
    }
};

module.exports = { login, register, verifyEmail, findAll, findById, update, deleteById };