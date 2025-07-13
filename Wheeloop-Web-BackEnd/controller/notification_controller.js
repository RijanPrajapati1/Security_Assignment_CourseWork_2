const Notification = require("../model/notification");

//  Send Notification (Admin Only)
const sendNotification = async (req, res) => {
    try {
        const { title, message } = req.body;

        const newNotification = new Notification({ title, message });
        await newNotification.save();

        res.status(201).json({ message: "Notification sent successfully.", notification: newNotification });
    } catch (error) {
        res.status(500).json({ message: "Error sending notification.", error: error.message });
    }
};

//  Get All Notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications.", error: error.message });
    }
};

//  Delete Notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.status(200).json({ message: "Notification deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting notification.", error: error.message });
    }
};

module.exports = { sendNotification, getNotifications, deleteNotification };
