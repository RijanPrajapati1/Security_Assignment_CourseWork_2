// src/controller/cred_controller.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Cred = require("../model/cred");
const crypto = require('crypto');
const passwordPolicy = require('../validation/password_validation');

// Environment Variables (RECOMMENDED: Move these to .env file and use `process.env.VARIABLE_NAME`)
const SECRET_KEY = process.env.JWT_SECRET || "8261ba19898d0dcdfe6c0c411df74b587b2e54538f5f451633b71e39f957cf01";
const EMAIL_USER = process.env.EMAIL_USER || "rijanpraz@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "hnbyxbgpqqtrwkci"; // Your Gmail App Password
const CLIENT_URL = process.env.CLIENT_URL || 'https://localhost:5173';

// Brute-force prevention settings
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_TIME_MINUTES = 5;
const OTP_EXPIRY_MINUTES = 1;

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use 'true' if connecting on 465, 'false' if on 587 with STARTTLS
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

// Helper function to generate JWT token for authentication
// mfa_verified will reflect if the initial MFA step was completed.
const generateAuthToken = (id, role, full_name, mfa_verified = false) => {
    return jwt.sign({ id, role, full_name, mfa_verified }, SECRET_KEY, { expiresIn: '24h' }); // Token valid for 24 hours
};

// Helper function to generate 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


// --- REGISTER CONTROLLER ---
const register = async (req, res) => {
    console.log("Register request received", req.body);
    const { email, password, full_name, address, phone_number } = req.body;

    let newCred = null;

    try {
        const validationResult = passwordPolicy(password);
        if (!validationResult.valid) {
            console.log("Registration failed: Password does not meet policy", email);
            return res.status(400).send(validationResult.message);
        }

        const existingCred = await Cred.findOne({ email });
        if (existingCred) {
            if (existingCred.isVerified) {
                console.log("Registration failed: Email already registered and verified", email);
                return res.status(400).send("Email already registered and verified. Please login.");
            } else {
                // If exists but not verified, it's a previous incomplete registration.
                // Delete the old unverified record to allow a fresh attempt.
                console.log("Existing unverified user found. Deleting and re-registering.", email);
                await Cred.deleteOne({ email });
            }
        }

        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000); // OTP valid for 1 minute

        // Create a new Cred record.
        newCred = new Cred({
            email,
            tempPassword: password, // Store unhashed password temporarily
            full_name,
            address,
            phone_number,
            role: "customer", // Default role
            mfaOtp: otp,
            mfaOtpExpires: otpExpires,
            isVerified: false, // Not verified until OTP is entered
            mfaEnabled: false // Initially false. Set to true after successful *registration* OTP verification.
            // This flag will now mean "initial setup with OTP is complete".
        });

        await newCred.save(); // Save the temporary user record
        console.log("Temporary user record created for OTP verification:", email);

        // Send OTP email
        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Your Wheeloop Email Verification Code',
            html: `
                <p>Hello ${full_name},</p>
                <p>Thank you for registering! Your One-Time Password (OTP) to verify your email is: <strong>${otp}</strong></p>
                <p>This code is valid for ${OTP_EXPIRY_MINUTES} minute. Do not share this code with anyone.</p>
                <p>If you did not attempt to register, please ignore this email.</p>
                <p>Thank you,</p>
                <p>The Wheeloop Team</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Registration OTP sent successfully to", email);

        // Send 202 Accepted, indicating OTP verification is pending
        res.status(202).json({
            message: 'Registration initiated. Please verify with OTP.',
            userId: newCred._id.toString(), // Send this back for the OTP verification step
            email: newCred.email // For frontend display
        });

    } catch (e) {
        console.error("Error during registration (OTP sending/user creation):", e);
        // If an error occurs after newCred was attempted to be created, delete the partial record
        if (newCred && newCred._id) {
            console.log("Attempting to delete partially created user record due to error:", newCred.email);
            await Cred.deleteOne({ _id: newCred._id });
        }
        res.status(500).json({ error: e.message || 'Server error during registration.' });
    }
};

// --- VERIFY REGISTRATION OTP ENDPOINT (initial signup verification) ---
const verifyRegistrationOtp = async (req, res) => {
    const { userId, otp } = req.body;

    try {
        // Find the user by ID and explicitly select tempPassword to complete the registration
        const cred = await Cred.findById(userId).select('+tempPassword');

        if (!cred) {
            console.log("Registration OTP verification failed: User not found for ID", userId);
            return res.status(404).send('User not found or registration session expired. Please re-register.');
        }

        // Validate OTP: existence, match, and expiry
        if (!cred.mfaOtp || !cred.mfaOtpExpires || cred.mfaOtp !== otp || cred.mfaOtpExpires < new Date()) {
            console.log("Registration OTP verification failed: Invalid or expired OTP for user", cred.email);
            // If OTP is incorrect/expired during registration, delete the unverified temporary record
            await Cred.deleteOne({ _id: userId });
            return res.status(401).send('Invalid or expired OTP. Please re-register.');
        }

        // --- OTP IS VALID, COMPLETE REGISTRATION ---

        // 1. Re-check password policy (though already checked at register, good for integrity)
        const validationResult = passwordPolicy(cred.tempPassword);
        if (!validationResult.valid) {
            console.log("Registration completion failed: Temporary password does not meet policy. Deleting record.", cred.email);
            await Cred.deleteOne({ _id: userId }); // Delete if tempPassword is bad for some reason
            return res.status(400).send('Password no longer meets policy. Please re-register.');
        }

        // 2. Hash the password from tempPassword
        const hashedPassword = await bcrypt.hash(cred.tempPassword, 10);

        // 3. Update the user record to finalize registration
        cred.password = hashedPassword; // Set the hashed password to the actual password field
        cred.tempPassword = undefined; // Clear temporary password
        cred.isVerified = true;       // Mark as verified
        cred.mfaEnabled = true;       // Set this to TRUE, indicating initial setup is complete.
        cred.mfaOtp = undefined;      // Clear OTP
        cred.mfaOtpExpires = undefined; // Clear OTP expiry

        await cred.save();
        console.log("User successfully registered, verified, and MFA 'one-time setup' enabled:", cred.email);

        // 4. Generate and send the final authentication token, logging the user in.
        // The token will reflect that initial MFA was verified.
        const token = generateAuthToken(cred._id.toString(), cred.role, cred.full_name, true); // true for mfa_verified

        res.status(200).json({
            message: 'Registration successful! Your account is activated.',
            token,
            role: cred.role,
            userId: cred._id.toString(),
            full_name: cred.full_name
        });

    } catch (error) {
        console.error('Error during registration OTP verification:', error);
        res.status(500).send('Server error during registration verification.');
    }
};

// --- LOGIN CONTROLLER (MODIFIED FOR "MFA ONE-TIME ONLY") ---
const login = async (req, res) => {
    console.log("Login request received", req.body);
    const { email, password } = req.body;

    try {
        const cred = await Cred.findOne({ email }).select('+password'); // Select password explicitly

        if (!cred) {
            console.log("Login failed: Email not found", email);
            return res.status(404).send('Invalid email or password');
        }

        if (cred.lockout_until && cred.lockout_until > new Date()) {
            const remainingMinutes = Math.ceil((cred.lockout_until - new Date()) / (1000 * 60));
            console.log(`Login failed: Account is locked for user ${email}.`);
            return res.status(403).send(`Account is locked. Please try again in ${remainingMinutes} minutes.`);
        }

        // Ensure email is verified (should always be true for users registered with the new flow)
        if (!cred.isVerified) {
            console.log(`Login failed: Email not verified for user ${email}.`);
            return res.status(401).send('Your account is not verified. Please complete registration.');
        }

        const validPassword = await cred.matchPassword(password);

        if (!validPassword) {
            console.log("Login failed: Incorrect password", email);

            cred.failed_login_attempts = (cred.failed_login_attempts || 0) + 1;

            if (cred.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
                cred.lockout_until = new Date(Date.now() + LOCKOUT_TIME_MINUTES * 60 * 1000);
                console.log(`User ${email} has been locked out for ${LOCKOUT_TIME_MINUTES} minutes.`);
                await cred.save();
                return res.status(401).send(`Too many failed login attempts. Your account has been locked for ${LOCKOUT_TIME_MINUTES} minutes.`);
            } else {
                await cred.save();
                const remainingAttempts = MAX_FAILED_ATTEMPTS - cred.failed_login_attempts;
                return res.status(401).send(`Invalid email or password. You have ${remainingAttempts} attempts remaining.`);
            }
        }

        // On successful password validation, reset failed attempts and lockout
        if (cred.failed_login_attempts > 0 || cred.lockout_until) {
            cred.failed_login_attempts = 0;
            cred.lockout_until = null;
            await cred.save();
        }

        // --- CORE CHANGE FOR "MFA ONE-TIME ONLY" ---
        // If cred.mfaEnabled is TRUE, it means the initial OTP verification for this account
        // has already been done. We now proceed directly to issuing the login token.
        // We DO NOT send an MFA OTP again for login.
        console.log("Login successful. MFA 'one-time setup' status is:", cred.mfaEnabled, "for user:", email);
        const token = generateAuthToken(cred._id.toString(), cred.role, cred.full_name, cred.mfaEnabled); // mfa_verified reflects initial setup status

        res.status(200).json({
            token,
            role: cred.role,
            userId: cred._id.toString(),
            full_name: cred.full_name
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error during login.');
    }
};

// --- VERIFY MFA OTP ENDPOINT (This endpoint will now effectively be dormant for *login* purposes) ---
// Its only potential use now would be if you later introduce a feature for users to *toggle* MFA on/off
// for additional security, and turning it on required a new OTP verification.
// For the "MFA one-time ever" login flow, the `login` function will no longer redirect here.
const verifyMfaOtp = async (req, res) => {
    // This logic remains the same, but the `login` route will no longer route to it.
    // It's kept here in case you want to reuse it for a "toggle MFA" feature later.
    const { userId, otp } = req.body;

    try {
        const cred = await Cred.findById(userId);

        if (!cred) {
            return res.status(404).send('User not found.');
        }


        if (!cred.mfaEnabled || !cred.mfaOtp || !cred.mfaOtpExpires || cred.mfaOtp !== otp || cred.mfaOtpExpires < new Date()) {
            cred.mfaOtp = undefined;
            cred.mfaOtpExpires = undefined;

            await cred.save();
            return res.status(401).send('Invalid or expired One-Time Password or MFA not initiated.');
        }

        // OTP is valid, clear it from DB
        cred.mfaOtp = undefined;
        cred.mfaOtpExpires = undefined;

        cred.failed_login_attempts = 0;
        cred.lockout_until = null;
        await cred.save();


        const token = generateAuthToken(cred._id.toString(), cred.role, cred.full_name, true);
        console.log(`MFA successful for user ${cred.email} (if this was an explicit MFA toggle/verification).`);

        res.status(200).json({
            message: 'MFA successful, operation complete.',
            token,
            role: cred.role,
            userId: cred._id.toString(),
            full_name: cred.full_name
        });

    } catch (error) {
        console.error('Error verifying MFA OTP:', error);
        res.status(500).send('Server error verifying MFA OTP.');
    }
};

const resendMfaOtp = async (req, res) => {
    const { userId } = req.body;

    try {
        const cred = await Cred.findById(userId);

        if (!cred) {
            return res.status(404).send('User not found.');
        }

        if (!cred.mfaEnabled || !cred.mfaOtp) {
            return res.status(400).send('MFA not initiated or already verified for this account.');
        }

        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        cred.mfaOtp = otp;
        cred.mfaOtpExpires = otpExpires;
        await cred.save();

        const mailOptions = {
            from: EMAIL_USER,
            to: cred.email,
            subject: 'Your Wheeloop One-Time Code',
            html: `
                <p>Hello ${cred.full_name},</p>
                <p>Your new One-Time Password (OTP) is: <strong>${otp}</strong></p>
                <p>This code is valid for ${OTP_EXPIRY_MINUTES} minute. Do not share this code with anyone.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Thank you,</p>
                <p>The Wheeloop Team</p>
            `,
        };
        await transporter.sendMail(mailOptions);
        res.status(200).send('New OTP sent to your registered email.');

    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).send('Error resending OTP.');
    }
};



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
        const user = await Cred.findById(req.params.id);
        if (!user) {
            console.log("User not found", req.params.id);
            return res.status(404).send("User not found");
        }
        console.log("User retrieved", user.email);
        res.status(200).json(user);
    } catch (e) {
        console.error("Error fetching user", e);
        res.status(500).json(e);
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.password) {
            const validationResult = passwordPolicy(updates.password);
            if (!validationResult.valid) {
                return res.status(400).send(validationResult.message);
            }
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const updatedUser = await Cred.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedUser) {
            console.log("User not found for update", id);
            return res.status(404).send("User not found");
        }
        updatedUser.password = undefined;
        console.log("User updated successfully", updatedUser.email);
        res.status(202).json(updatedUser);
    } catch (e) {
        console.error("Error updating user", e);
        if (e.name === 'ValidationError') {
            return res.status(400).send(e.message);
        }
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

module.exports = {
    login,
    register,
    verifyRegistrationOtp,
    verifyMfaOtp,
    resendMfaOtp,
    findAll,
    findById,
    update,
    deleteById
};