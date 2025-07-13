const Car = require("../model/car");

// ✅ Fetch All Cars with Correct Image Path
const findAll = async (req, res) => {
    try {
        const cars = await Car.find();
        const carsWithImages = cars.map(car => ({
            ...car._doc,
            image: `http://localhost:3001/car_images/${car.image}`
        }));
        res.status(200).json(carsWithImages);
    } catch (e) {
        res.status(500).json({ message: "Error fetching cars", error: e.message });
    }
};

// ✅ Save Car with Image Upload
const save = async (req, res) => {
    try {
        const { name, type, price, description, transmission } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!image) return res.status(400).json({ message: "Image is required" });

        const car = new Car({
            name,
            type,
            price,
            description,
            transmission,
            image
        });

        await car.save();
        res.status(201).json(car);
    } catch (e) {
        res.status(500).json({ message: "Error saving car", error: e.message });
    }
};

// ✅ Find Car By ID (Ensure Image URL is Full Path)
const findById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: "Car not found" });

        res.status(200).json({
            ...car._doc,
            image: `http://localhost:3001/car_images/${car.image}`
        });
    } catch (e) {
        res.status(500).json({ message: "Error fetching car", error: e.message });
    }
};

// ✅ Update Car (Keep Existing Image if No New Image Provided)
const update = async (req, res) => {
    try {
        const { name, type, price, description, transmission } = req.body;
        let image = req.file ? req.file.filename : null;

        const existingCar = await Car.findById(req.params.id);
        if (!existingCar) return res.status(404).json({ message: "Car not found" });

        if (!image) image = existingCar.image; // Keep old image if not updated

        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            { name, type, price, description, transmission, image },
            { new: true }
        );

        res.status(200).json({
            ...updatedCar._doc,
            image: `http://localhost:3001/car_images/${updatedCar.image}`
        });
    } catch (e) {
        res.status(500).json({ message: "Error updating car", error: e.message });
    }
};

// ✅ Delete Car
const deleteById = async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Car deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: "Error deleting car", error: e.message });
    }
};

module.exports = {
    findAll,
    save,
    findById,
    update,
    deleteById
};
