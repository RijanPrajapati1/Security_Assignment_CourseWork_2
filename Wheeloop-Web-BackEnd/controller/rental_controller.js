
const Rental = require("../model/rental")

const findAll = async (req, res) => {
    try {
        const rentals = await Rental.find()
            .populate('userId')
            .populate('carId');

        res.status(200).json(rentals);
    } catch (e) {
        console.error("Error fetching all rentals:", e); // Log the error
        res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
};


const findUserBookings = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const rentals = await Rental.find({ userId })
            .populate("userId", "email")
            .populate("carId", "name image"); // Ensure carId includes name and image

        if (!rentals.length) {
            return res.status(404).json({ message: "No bookings found" });
        }

        // Ensure correct image path without duplication
        rentals.forEach((rental) => {
            if (rental.carId && rental.carId.image) {
                // If image URL already contains "http", don't modify it
                if (!rental.carId.image.startsWith("http")) {
                    rental.carId.image = `https://localhost:3001/car_images/${rental.carId.image}`;
                }
            }
        });

        res.status(200).json(rentals);
    } catch (e) {
        console.error("Error fetching user bookings:", e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


//  Get  booking for mobile
const getUserBookings = async (req, res) => {
    try {
        const rentals = await Rental.find().sort({ bookedAt: -1 });
        res.status(200).json({ success: true, rentals });
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings.", error: error.message });
    }
};


const getAdminBookings = async (req, res) => {
    try {
        const bookings = await Rental.find()
            .populate("userId", "email") // Fetch user email
            .populate("carId", "name image"); // Fetch car details

        res.status(200).json(bookings);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Update booking status or details
const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        const updatedBooking = await Rental.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json(updatedBooking);
    } catch (err) {
        console.error("Error updating booking:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Delete booking
const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        const deletedBooking = await Rental.findByIdAndDelete(id);

        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (err) {
        console.error("Error deleting booking:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const save = async (req, res) => {
    try {
        const { body } = req
        console.log("Request Body: ", body);
        const rentals = new Rental(body);
        await rentals.save()
        res.status(201).json(rentals)
    } catch (e) {
        console.error("Error: ", e);
        res.status(500).json(e)
    }
}

const mongoose = require("mongoose");

const findById = async (req, res) => {
    try {
        const { id } = req.params;

        // Use mongoose's built-in function to validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid rental ID format" });
        }

        const rental = await Rental.findById(id)
            .populate("userId")
            .populate("carId");

        if (!rental) {
            return res.status(404).json({ message: "Rental not found" });
        }

        res.status(200).json(rental);
    } catch (e) {
        console.error("Error fetching rental by ID:", e);
        res.status(500).json({ message: "Internal Server Error", error: e.message });
    }
};




const deleteById = async (req, res) => {
    try {
        const rentals = await Rental.findByIdAndDelete(req.params.id);
        res.status(200).json("Data Deleted")
    } catch (e) {
        res.status(500).json(e)
    }
}

const update = async (req, res) => {
    try {
        const rentals = await Rental.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(202).json(rentals)
    } catch (e) {
        res.status(500).json(e)
    }
}


module.exports = {
    findAll,
    save,
    findUserBookings,
    findById,
    deleteById,
    update,
    getAdminBookings,
    deleteBooking,
    updateBooking,
    getUserBookings
}