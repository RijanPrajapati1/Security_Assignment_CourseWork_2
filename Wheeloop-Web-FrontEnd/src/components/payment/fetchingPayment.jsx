import { useEffect, useState } from "react";

import Navbar from "../navBar/navbar";
import axiosInstance from "../utils/axios";

//  Fetch payments by User ID
const fetchPayments = async (userId) => {
    try {
        const response = await axiosInstance.get(`/payment/user/${userId}`);
        return response.data.payments || [];
    } catch (error) {
        console.error("❌ Error fetching payments:", error);
        return [];
    }
};

const FetchPayment = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Retrieve userId from localStorage
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) {
            setError("User is not logged in.");
            setLoading(false);
            return;
        }

        const getPayments = async () => {
            try {
                setLoading(true);
                const fetchedPayments = await fetchPayments(userId);
                setPayments(fetchedPayments);
            } catch (error) {
                setError("Failed to load payment details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        getPayments();
    }, [userId]);

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold text-black mb-4">Your Payment Details</h1>

                {loading && <p className="loading-text">Loading your payment details...</p>}
                {error && <p className="error-text text-red-500">Error: {error}</p>}

                <div className="bg-white p-4 rounded-lg shadow-md">
                    {payments.length === 0 ? (
                        <p className="no-payments text-center">No payments found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border border-black shadow-md rounded-lg">
                                <thead>
                                    <tr className="bg-purple-700 text-white">
                                        <th className="p-3 text-left">#</th>
                                        <th className="p-3 text-left">Payment ID</th>
                                        <th className="p-3 text-left">Booking ID</th>
                                        <th className="p-3 text-left">Total Amount</th>
                                        <th className="p-3 text-left">Payment Method</th>
                                        <th className="p-3 text-left">Transaction ID</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 text-left">Payment Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment, index) => (
                                        <tr key={payment._id} className="border-b hover:bg-gray-200">
                                            <td className="p-3">{index + 1}</td>
                                            <td className="p-3">{payment._id}</td>
                                            <td className="p-3">{payment.bookingId?._id || "N/A"}</td>
                                            <td className="p-3">Rs. {payment.totalAmount}</td>
                                            <td className="p-3">{payment.paymentMethod}</td>
                                            <td className="p-3">{payment.transactionId || "37t42432479832842"}</td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.paymentStatus === "pending"
                                                        ? "bg-yellow-200 text-yellow-800"
                                                        : payment.paymentStatus === "completed"
                                                            ? "bg-green-200 text-green-800"
                                                            : "bg-red-200 text-red-800"
                                                        }`}
                                                >
                                                    {payment.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FetchPayment;
