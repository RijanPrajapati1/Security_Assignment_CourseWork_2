import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import axiosInstance from "../utils/axios";

const ManageNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchNotifications();
    }, []);

    //  Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get("/notification/all");
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    //  Send Notification
    const sendNotification = async () => {
        if (!title || !message) {
            alert("Title and message are required!");
            return;
        }

        try {
            await axiosInstance.post("/notification/send", { title, message });
            fetchNotifications();
            setTitle("");
            setMessage("");
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    };

    //  Delete Notification
    const deleteNotification = async (id) => {
        try {
            await axiosInstance.delete(`/notification/delete/${id}`);
            fetchNotifications();
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Manage Notifications</h2>

            {/* Input Fields */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white px-4 py-2 border rounded-lg mb-2"
                />
                <textarea
                    placeholder="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 bg-white py-2 border rounded-lg mb-2"
                />
                <button onClick={sendNotification} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Send Notification
                </button>
            </div>

            {/* Notification List */}
            <h3 className="text-xl font-semibold mt-6">Sent Notifications</h3>
            <ul className="mt-4">
                {notifications.map((notification) => (
                    <li key={notification._id} className="border-b py-2 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold">{notification.title}</h4>
                            <p className="text-black-600">{notification.message}</p>
                        </div>
                        <button onClick={() => deleteNotification(notification._id)} className="text-red-500">
                            <FaTrash />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManageNotifications;
