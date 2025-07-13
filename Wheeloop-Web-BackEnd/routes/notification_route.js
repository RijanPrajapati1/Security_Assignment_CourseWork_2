const express = require("express");
const { sendNotification, getNotifications, deleteNotification } = require("../controller/notification_controller");

const router = express.Router();

//  Send Notification (Admin Only)
router.post("/send", sendNotification);

// Get All Notifications
router.get("/all", getNotifications);

//  Delete Notification
router.delete("/delete/:id", deleteNotification);

module.exports = router;
