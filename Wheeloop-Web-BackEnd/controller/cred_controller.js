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
const register = async (req, res) => {
    console.log("Register request received", req.body);
    const { email, password, full_name, address, phone_number } = req.body;

    // --- NEW: Password Policy Check ---
    const validationResult = passwordPolicy(password);
    if (!validationResult.valid) {
        console.log("Registration failed: Password does not meet policy", email);
        return res.status(400).send(validationResult.message);
    }
    // --- END NEW ---

    const role = "customer"; // Force role to "customer"

    const existingCred = await Cred.findOne({ email });
    if (existingCred) {
        console.log("Registration failed: Email already registered", email);
        return res.status(400).send("Email already registered.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const cred = new Cred({ email, password: hashedPassword, role, full_name, address, phone_number });

    try {
        await cred.save();
        console.log("User registered successfully", email);

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "rijanpraz@gmail.com",
                pass: "hnbyxbgpqqtrwkci"
            }
        });

        const info = await transporter.sendMail({
            from: "rijanpraz@gmail.com",
            to: cred.email,
            subject: "Registration Successful",
            html: `<h1>Registration Successful</h1><p>Dear ${cred.full_name}, Your account has been created.</p>`
        });

        console.log("Email sent successfully to", cred.email);
        res.status(201).send({ message: "You have successfully registered.", user: cred, emailInfo: info });

    } catch (e) {
        console.error("Error during registration", e);
        res.status(500).json(e);
    }
};


// Verify Email Controller - UNCHANGED
const verifyEmail = async (req, res) => {
    console.log("Email verification request received", req.query);
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("Decoded token", decoded);
        const user = await Cred.findOne({ email: decoded.email });

        if (!user) {
            console.log("Email verification failed: User not found", decoded.email);
            return res.status(404).send("User not found.");
        }

        user.isVerified = true;
        await user.save();
        console.log("Email verified successfully", decoded.email);
        res.status(200).send("Email verified successfully.");
    } catch (e) {
        console.error("Email verification error", e);
        res.status(400).send("Invalid or expired token.");
    }
};

// Login Controller - UPDATED
const login = async (req, res) => {
    console.log("Login request received", req.body);
    const { email, password } = req.body;
    let cred = await Cred.findOne({ email });

    if (!cred) {
        console.log("Login failed: Email not found", email);
        return res.status(403).send('Invalid email or password');
    }

    // Check if the account is currently locked out
    if (cred.lockout_until && cred.lockout_until > new Date()) {
        const remainingMinutes = Math.ceil((cred.lockout_until - new Date()) / (1000 * 60));
        console.log(`Login failed: Account is locked for user ${email}.`);
        return res.status(403).send(`Account is locked. Please try again in ${remainingMinutes} minutes.`);
    }

    const validPassword = await bcrypt.compare(password, cred.password);

    if (!validPassword) {
        console.log("Login failed: Incorrect password", email);

        // --- NEW: Countdown logic ---
        cred.failed_login_attempts += 1;
        await cred.save();

        const remainingAttempts = MAX_FAILED_ATTEMPTS - cred.failed_login_attempts;
        if (remainingAttempts > 0) {
            // Send the specific countdown message
            return res.status(403).send(`Invalid email or password. You have ${remainingAttempts} attempts remaining.`);
        } else {
            // Lockout logic for too many failed attempts
            cred.lockout_until = new Date(Date.now() + LOCKOUT_TIME_MINUTES * 60 * 1000);
            console.log(`User ${email} has been locked out for ${LOCKOUT_TIME_MINUTES} minutes.`);
            await cred.save();
            return res.status(403).send(`Too many failed login attempts. Your account has been locked for ${LOCKOUT_TIME_MINUTES} minutes.`);
        }
        // --- END NEW ---
    }

    // On successful login, reset failed attempts and lockout
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