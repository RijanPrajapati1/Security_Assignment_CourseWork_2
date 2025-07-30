import { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import axiosInstance from "../utils/axios";

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);


    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axiosInstance.get("/rental/adminBookings");
                setBookings(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setError("Failed to load bookings.");
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);


    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };


    const filteredBookings = bookings.filter(
        (booking) =>
            booking.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.carId?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axiosInstance.put(`/rental/updateBooking/${id}`, { status: newStatus });
            setBookings((prev) =>
                prev.map((booking) =>
                    booking._id === id ? { ...booking, status: newStatus } : booking
                )
            );
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };


    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            try {
                await axiosInstance.delete(`/rental/deleteBooking/${id}`);
                setBookings((prev) => prev.filter((booking) => booking._id !== id));
            } catch (err) {
                console.error("Error deleting booking:", err);
            }
        }
    };


    const handleEdit = (booking) => {
        setCurrentBooking({ ...booking });
        setIsEditing(true);
    };


    const handleSave = async () => {
        if (!currentBooking) return;

        try {
            await axiosInstance.put(`/rental/updateBooking/${currentBooking._id}`, currentBooking);
            setBookings((prev) =>
                prev.map((booking) =>
                    booking._id === currentBooking._id ? currentBooking : booking
                )
            );
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating booking:", err);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-deepPurple">Manage Bookings</h2>

            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by user or car"
                className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />


            {isEditing && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-primary">Edit Booking</h3>

                        <label className="block mb-2 text-sm font-medium text-gray-600">User Email</label>
                        <input
                            type="text"
                            value={currentBooking.userId?.email}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Car</label>
                        <input
                            type="text"
                            value={currentBooking.carId?.name}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Pick-Up Location</label>
                        <input
                            type="text"
                            value={currentBooking.pickUpLocation}
                            onChange={(e) =>
                                setCurrentBooking({ ...currentBooking, pickUpLocation: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Status</label>
                        <select
                            value={currentBooking.status}
                            onChange={(e) =>
                                setCurrentBooking({ ...currentBooking, status: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg mb-4"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Rejected">Rejected</option>
                        </select>

                        <div className="mt-6">
                            <button onClick={handleSave} className="w-full px-4 py-3 bg-green-500 text-white rounded-lg mb-4">
                                Save Changes
                            </button>
                            <button onClick={() => setIsEditing(false)} className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <table className="table-auto w-full border mt-6">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-4 py-2">Booking ID</th>
                        <th className="px-4 py-2">User Email</th>
                        <th className="px-4 py-2">Car</th>
                        <th className="px-4 py-2">Pick-Up Location</th>
                        <th className="px-4 py-2">Start Date</th>
                        <th className="px-4 py-2">End Date</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.map((booking) => (
                        <tr key={booking._id}>
                            <td className="border px-4 py-2">{booking._id}</td>
                            <td className="border px-4 py-2">{booking.userId?.email}</td>
                            <td className="border px-4 py-2">{booking.carId?.name}</td>
                            <td className="border px-4 py-2">{booking.pickUpLocation}</td>
                            <td className="border px-4 py-2">{booking.startDate}</td>
                            <td className="border px-4 py-2">{booking.endDate}</td>
                            <td className="border px-4 py-2">{booking.status}</td>
                            <td className="border px-4 py-2">
                                <button onClick={() => handleEdit(booking)} className="text-blue-500 mr-5">
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDelete(booking._id)} className="text-red-500">
                                    <FaTrashAlt />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageBookings;
