const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    transmission: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
})

const Cars = mongoose.model("cars", carSchema)

module.exports = Cars;