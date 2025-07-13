import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import axiosInstance from "../utils/axios";

const ManagePayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(null);

    // Fetch all payments for Admin
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axiosInstance.get("/payment/fetchAll");
                setPayments(response.data.payments);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching payments:", err);
                setError("Failed to load payments.");
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    // Handle search input
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    // Filter payments based on search (User Email, User ID, or Booking ID)
    const filteredPayments = payments.filter(
        (payment) =>
            payment.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.userId?._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.bookingId?._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle status change
    const handleStatusChange = async (id, newStatus) => {
        try {
            await axiosInstance.put(`/payment/update/${id}`, { paymentStatus: newStatus });
            setPayments((prev) =>
                prev.map((payment) =>
                    payment._id === id ? { ...payment, paymentStatus: newStatus } : payment
                )
            );
        } catch (err) {
            console.error("Error updating payment status:", err);
        }
    };

    // Handle delete action with confirmation alert
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this payment?")) {
            try {
                await axiosInstance.delete(`/payment/delete/${id}`);
                setPayments((prev) => prev.filter((payment) => payment._id !== id));
            } catch (err) {
                console.error("Error deleting payment:", err);
            }
        }
    };
    // Handle edit modal toggle
    const handleEdit = (payment) => {
        setCurrentPayment({ ...payment });
        setIsEditing(true);
    };

    // Handle save action in edit modal
    const handleSave = async () => {
        if (!currentPayment) return;

        try {
            await axiosInstance.put(`/payment/update/${currentPayment._id}`, {
                paymentStatus: currentPayment.paymentStatus,
            });

            setPayments((prev) =>
                prev.map((payment) =>
                    payment._id === currentPayment._id ? currentPayment : payment
                )
            );
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating payment:", err);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-deepPurple">Manage Payments</h2>

            <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by Email, User ID, or Booking ID"
                className="w-full px-4 py-3 bg-white text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/*  Edit Payment Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-primary">Edit Payment</h3>

                        <label className="block mb-2 text-sm font-medium text-gray-600">User Email</label>
                        <input
                            type="text"
                            value={currentPayment.userId?.email}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Booking ID</label>
                        <input
                            type="text"
                            value={currentPayment.bookingId?._id}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Total Amount (Rs)</label>
                        <input
                            type="text"
                            value={currentPayment.totalAmount}
                            readOnly
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-400 rounded-lg mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-600">Status</label>
                        <select
                            value={currentPayment.paymentStatus}
                            onChange={(e) =>
                                setCurrentPayment({ ...currentPayment, paymentStatus: e.target.value })
                            }
                            className="w-full bg-white px-4 py-3 border border-gray-400 rounded-lg mb-4"
                        >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
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

            {/* ✅ Payment Table */}
            <table className="table-auto w-full border mt-6">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-4 py-2">Payment ID</th>
                        <th className="px-4 py-2">User Email</th>
                        <th className="px-4 py-2">User ID</th>
                        <th className="px-4 py-2">Booking ID</th>
                        <th className="px-4 py-2">Total Amount</th>
                        <th className="px-4 py-2">Method</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPayments.map((payment) => (
                        <tr key={payment._id}>
                            <td className="border px-4 py-2">{payment._id}</td>
                            <td className="border px-4 py-2">{payment.userId?.email}</td>
                            <td className="border px-4 py-2">{payment.userId?._id}</td>
                            <td className="border px-4 py-2">{payment.bookingId?._id}</td>
                            <td className="border px-4 py-2">Rs. {payment.totalAmount}</td>
                            <td className="border px-4 py-2">{payment.paymentMethod}</td>
                            <td className="border px-4 py-2">
                                <select
                                    value={payment.paymentStatus}
                                    onChange={(e) => handleStatusChange(payment._id, e.target.value)}
                                    className="border px-2 py-1 rounded-lg"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </td>
                            <td className="border px-4 py-2">
                                <button onClick={() => handleEdit(payment)} className="text-blue-500 mr-5">
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDelete(payment._id)} className="text-red-500">
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

export default ManagePayments;
