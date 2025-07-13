import React, { useEffect, useState } from "react";


import Navbar from "../Navbar/navbar";
import axiosInstance from "../utils/axios";

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get("/notification/all");
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    // Mark notification as read
    const handleNotificationClick = async (notificationId) => {
        try {
            await axiosInstance.put(`/notification/markAsRead/${notificationId}`);
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification._id === notificationId
                        ? { ...notification, isNew: false }
                        : notification
                )
            );
        } catch (error) {
            console.error("Error updating notification status:", error);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <div className="bg-white border border-black shadow-lg rounded-lg p-6 mx-auto max-w-2xl mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-center text-black">System Notifications</h2>

                {notifications.length === 0 ? (
                    <p className="text-gray-600 text-center">No notifications available.</p>
                ) : (
                    <ul className="mt-4">
                        {notifications.map((notification) => (
                            <li
                                key={notification._id}
                                className="border-b border-black py-3 px-4 flex justify-between items-center cursor-pointer hover:bg-gray-200"
                                onClick={() => handleNotificationClick(notification._id)}
                            >
                                <div>
                                    <h4 className="font-bold text-black">{notification.title}</h4>
                                    <p className="text-gray-700">{notification.message}</p>
                                </div>
                                {notification.isNew && (
                                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                        New
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
