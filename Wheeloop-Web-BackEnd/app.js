// app.js (Your existing file, confirmed correct for integration)

const express = require("express")
const connectDb = require("./config/db"); // Assuming this connects to MongoDB
const user_route = require("./routes/user_route") // Assuming this is for other user-related entities
const car_route = require("./routes/car_route")
const rental_route = require("./routes/rental_route")
const review_route = require("./routes/review_route")
const payment_route = require("./routes/payment_route")
const notification_route = require("./routes/notification_route")

const cors = require('cors');
const cred_route = require("./routes/cred_route") // Your cred routes
const path = require("path");

const app = express();

// Load environment variables (install 'dotenv': npm install dotenv)
require('dotenv').config();

connectDb(); // Connect to your database
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Use env variable for client URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
}));

app.use(express.json()); // For parsing JSON request bodies


// Static file serving (e.g., for car images)
app.use("/car_images", express.static(path.join(__dirname, "car_images")));

// API routes
app.use("/api/user", user_route); // Might need to consolidate if all user data is in Cred
app.use("/api/car", car_route);
app.use("/api/rental", rental_route);
app.use("/api/cred", cred_route); // Your main authentication/user management routes
app.use("/api/review", review_route);
app.use("/api/payment", payment_route);
app.use("/api/notification", notification_route);


const port = process.env.PORT || 3001; // Use env variable for port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})

module.exports = app;