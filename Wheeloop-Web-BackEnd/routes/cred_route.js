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


const express = require("express");
const router = express.Router();
const { login, register, verifyEmail, findAll, findById, update, deleteById } = require("../controller/cred_controller");
const { authenticateToken, authorizeRole } = require("../security/auth");
const UserValidation = require("../validation/user_validation");

// Registration route with validation
router.post("/register",
    // UserValidation, 
    register);

// Email Verification Route
router.get("/verify-email", verifyEmail);

// Login route
router.post("/login", login);

// CRUD operations for users
router.get("/users", authenticateToken, findAll); // Get all users (protected)

// --- FIX: Uncommented middleware for security ---
router.get("/users/:id",
    authenticateToken, // Now this route requires a valid token
    findById); // Get user by ID

// We will use this route for profile updates in a later step
// --- FIX: Uncommented middleware for security ---
router.put("/users/:id",
    authenticateToken, // Now this route requires a valid token
    update); // Update user by ID

// Admin-only routes
router.delete("/users/:id",
    authenticateToken, authorizeRole("admin"),
    deleteById);  // Delete user by ID

router.get("/admin-data", authenticateToken, authorizeRole("admin"), (req, res) => {
    res.send("Admin-specific data: You have admin access!");
});

// Customer-specific route
router.get("/customer-data", authenticateToken, authorizeRole("customer"), (req, res) => {
    res.send("Customer-specific data: Welcome, customer!");
});

module.exports = router;