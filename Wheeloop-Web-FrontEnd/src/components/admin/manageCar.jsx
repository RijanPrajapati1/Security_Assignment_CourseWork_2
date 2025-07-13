import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import axiosInstance from "../utils/axios";

const ManageCars = () => {
    const [cars, setCars] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [currentCar, setCurrentCar] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // ✅ Fetch Cars on Component Mount
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await axiosInstance.get("/car/findAll");
                setCars(response.data);
            } catch (error) {
                console.error("Error fetching cars:", error);
            }
        };
        fetchCars();
    }, []);

    // ✅ Save Car (Add or Update)
    const handleSave = async () => {
        const formData = new FormData();
        formData.append("name", currentCar.name);
        formData.append("type", currentCar.type);
        formData.append("price", currentCar.price);
        formData.append("transmission", currentCar.transmission);
        formData.append("description", currentCar.description);

        if (currentCar.image instanceof File) {
            formData.append("image", currentCar.image);
        }

        try {
            if (isAdding) {
                const response = await axiosInstance.post("/car", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setCars([...cars, response.data]);
                setIsAdding(false);
            } else if (isEditing) {
                const response = await axiosInstance.put(`/car/${currentCar._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setCars(cars.map((car) => (car._id === currentCar._id ? response.data : car)));
                setIsEditing(false);
            }
            setCurrentCar(null);
            setImagePreview(null);
        } catch (error) {
            console.error("Error saving car:", error);
        }
    };

    // ✅ Delete Car (Confirmation Alert)
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this car?")) {
            try {
                await axiosInstance.delete(`/car/${id}`);
                setCars(cars.filter((car) => car._id !== id));
            } catch (error) {
                console.error("Error deleting car:", error);
            }
        }
    };

    // ✅ Search Filter
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCars = cars.filter(
        (car) =>
            car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ Handle Edit
    const handleEdit = (car) => {
        setCurrentCar({ ...car });
        setImagePreview(car.image); // Keep existing image preview
        setIsEditing(true);
    };

    // ✅ Handle Add
    const handleAddCar = () => {
        setCurrentCar({ name: "", type: "", price: "", transmission: "", description: "", image: null });
        setImagePreview(null);
        setIsAdding(true);
    };

    // ✅ Handle Image Change (Preview Before Upload)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCurrentCar({ ...currentCar, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-deepPurple">Manage Cars</h2>

            {/* ✅ Search & Add Car Button */}
            <div className="flex items-center mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by car name or description"
                    className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                    onClick={handleAddCar}
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Add Car
                </button>
            </div>

            {/* ✅ Add/Edit Car Modal */}
            {(isAdding || isEditing) && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4">{isAdding ? "Add Car" : "Edit Car"}</h3>

                        <label className="block mb-2 text-sm font-medium">Car Name</label>
                        <input
                            type="text"
                            value={currentCar.name}
                            onChange={(e) => setCurrentCar({ ...currentCar, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium">Type</label>
                        <input
                            type="text"
                            value={currentCar.type}
                            onChange={(e) => setCurrentCar({ ...currentCar, type: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium">Price</label>
                        <input
                            type="text"
                            value={currentCar.price}
                            onChange={(e) => setCurrentCar({ ...currentCar, price: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium">Transmission</label>
                        <input
                            type="text"
                            value={currentCar.transmission}
                            onChange={(e) => setCurrentCar({ ...currentCar, transmission: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium">Description</label>
                        <input
                            type="text"
                            value={currentCar.description}
                            onChange={(e) => setCurrentCar({ ...currentCar, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium">Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />
                        {imagePreview && <img src={imagePreview} alt="Car Preview" className="w-40 mb-4 rounded-lg" />}

                        <div className="mt-6">
                            <button onClick={handleSave} className="w-full px-4 py-3 bg-green-500 text-white rounded-lg">
                                Save Changes
                            </button>
                            <button onClick={() => { setIsAdding(false); setIsEditing(false); setCurrentCar(null); }}
                                className="w-full px-4 py-3 mt-2 bg-gray-500 text-white rounded-lg">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Cars Table */}
            <table className="table-auto w-full border mt-6">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-4 py-2">Car Name</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Transmission</th>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2">Image</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCars.map((car) => (
                        <tr key={car._id}>
                            <td className="border px-4 py-2">{car.name}</td>
                            <td className="border px-4 py-2">{car.type}</td>
                            <td className="border px-4 py-2">{car.price}</td>
                            <td className="border px-4 py-2">{car.transmission}</td>
                            <td className="border px-4 py-2">{car.description}</td>
                            <td className="border px-4 py-2"><img src={car.image} className="w-20 h-20" /></td>
                            <td className="border px-4 py-2">
                                <button onClick={() => handleEdit(car)} className="text-blue-500 mr-5"><FaEdit /></button>
                                <button onClick={() => handleDelete(car._id)} className="text-red-500"><FaTrashAlt /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageCars;
