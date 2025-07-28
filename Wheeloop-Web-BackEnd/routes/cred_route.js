// const express = require("express")
// const router = express.Router()

// const { login, register } = require("../controller/cred_controller")
// const { authenticateToken, authorizeRole } = require("../security/auth")


// router.post("/login", login);
// // // router.post("/register", authenticateToken, register); //use here authenticate token after gettign token once
// // router.post("/register", register);

// // // Admin-specific route
// // router.get("/admin-data", authenticateToken, authorizeRole("admin"), (req, res) => {
// //     res.send("Admin-specific data: You have admin access!");
// // });


// // // Customer-specific route
// // router.get("/customer-data", authenticateToken, authorizeRole("customer"), (req, res) => {
// //     res.send("Customer-specific data: Welcome, customer!");
// // });

// // Register route with conditional authentication
// router.post("/register", async (req, res, next) => {
//     try {
//         const { role } = req.body;

//         // If role is admin, require authentication
//         if (role === "admin") {
//             return authenticateToken(req, res, next);
//         }

//         // If role is not admin, proceed without authentication
//         next();
//     } catch (err) {
//         res.status(500).send("Error processing request");
//     }
// }, register);

// // Admin-specific route
// router.get("/admin-data", authenticateToken, authorizeRole("admin"), (req, res) => {
//     res.send("Admin-specific data: You have admin access!");
// });

// // Customer-specific route
// router.get("/customer-data", authenticateToken, authorizeRole("customer"), (req, res) => {
//     res.send("Customer-specific data: Welcome, customer!");
// });



// module.exports = router;


// src/routes/cred_route.js

// src/routes/cred_route.js

const express = require("express");
const router = express.Router();
const {
    login,
    register,
    verifyRegistrationOtp, // NEW
    verifyMfaOtp,
    resendMfaOtp, // New for subsequent login OTP resend
    findAll,
    findById,
    update,
    deleteById
} = require("../controller/cred_controller");
const { authenticateToken, authorizeRole } = require("../security/auth");

// Public routes
router.post("/register", register);
// --- NEW: Route for verifying registration OTP ---
router.post("/verify-registration-otp", verifyRegistrationOtp); // No authentication needed here
// --- END NEW ---
router.post("/login", login);

// MFA routes for *subsequent* logins
router.post("/verify-mfa-otp", verifyMfaOtp);
router.post("/resend-mfa-otp", resendMfaOtp); // Added resend for login MFA

// CRUD operations for users (protected routes)
router.get("/users", authenticateToken, findAll);
router.get("/users/:id", authenticateToken, findById);
router.put("/users/:id", authenticateToken, update);

// Admin-only routes
router.delete("/users/:id", authenticateToken, authorizeRole("admin"), deleteById);
router.get("/admin-data", authenticateToken, authorizeRole("admin"), (req, res) => {
    res.send("Admin-specific data: You have admin access!");
});
router.get("/customer-data", authenticateToken, authorizeRole("customer"), (req, res) => {
    res.send("Customer-specific data: Welcome, customer!");
});

module.exports = router;