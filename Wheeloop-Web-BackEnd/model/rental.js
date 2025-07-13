const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cred"
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cars"
    },
    pickUpLocation: {
        type: String,
        required: true
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
})

const Rental = mongoose.model("rentals", rentalSchema)

module.exports = Rental;