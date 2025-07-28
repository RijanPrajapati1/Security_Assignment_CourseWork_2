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

const app = express();

connectDb();
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
}));

app.use(express.json());


app.use("/car_images", express.static(path.join(__dirname, "car_images")));
app.use("/api/user", user_route);
app.use("/api/car", car_route);
app.use("/api/rental", rental_route);
app.use("/api/cred", cred_route);
app.use("/api/review", review_route);
app.use("/api/payment", payment_route);
app.use("/api/notification", notification_route);

const port = 3001;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})


//for testing
module.exports = app