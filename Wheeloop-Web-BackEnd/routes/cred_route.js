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
router.get("/users", findAll);  // Get all users
router.get("/users/:id",
    // authenticateToken,
    // authorizeRole("admin"),
    findById);  // Get user by ID
router.put("/users/:id",
    // authenticateToken, authorizeRole("admin"),
    update);  // Update user by ID
router.delete("/users/:id",
    authenticateToken, authorizeRole("admin"),
    deleteById);  // Delete user by ID

// Admin-specific route
router.get("/admin-data", authenticateToken, authorizeRole("admin"), (req, res) => {
    res.send("Admin-specific data: You have admin access!");
});

// Customer-specific route
router.get("/customer-data", authenticateToken, authorizeRole("customer"), (req, res) => {
    res.send("Customer-specific data: Welcome, customer!");
});

module.exports = router;
