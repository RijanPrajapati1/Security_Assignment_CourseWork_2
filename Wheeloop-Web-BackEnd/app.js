// app.js (Backend Entry Point)

const express = require("express")
const connectDb = require("./config/db");
const user_route = require("./routes/user_route")
const car_route = require("./routes/car_route")
const rental_route = require("./routes/rental_route")
const review_route = require("./routes/review_route")
const payment_route = require("./routes/payment_route")
const notification_route = require("./routes/notification_route")

const cors = require('cors');
const cred_route = require("./routes/cred_route")
const path = require("path");

// --- NEW: HTTPS modules ---
const https = require('https');
const fs = require('fs');
// --- END NEW ---

const app = express();

// Load environment variables (install 'dotenv': npm install dotenv)
require('dotenv').config(); // MUST be at the very top to load .env variables

connectDb(); // Connect to your database
app.use(cors({
    origin: process.env.CLIENT_URL || "https://localhost:5173", // Use env variable for client URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
}));

app.use(express.json()); // For parsing JSON request bodies


// Static file serving (e.g., for car images)
app.use("/car_images", express.static(path.join(__dirname, "car_images")));

// API routes
app.use("/api/user", user_route);
app.use("/api/car", car_route);
app.use("/api/rental", rental_route);
app.use("/api/cred", cred_route); // Your main authentication/user management routes
app.use("/api/review", review_route);
app.use("/api/payment", payment_route);
app.use("/api/notification", notification_route);


const port = process.env.PORT || 3001; // Use env variable for port

// --- OLD app.listen() block is REMOVED ---
// --- NEW: HTTPS Server Configuration ---
// Read the generated server.key and server.crt files from the backend directory
const privateKey = fs.readFileSync(path.join(__dirname, 'server.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'server.crt'), 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Create the HTTPS server
const httpsServer = https.createServer(credentials, app);

// Listen for HTTPS connections
httpsServer.listen(port, () => {
    console.log(`HTTPS Server running at https://localhost:${port}`)
})

module.exports = app;