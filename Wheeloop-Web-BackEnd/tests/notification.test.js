const request = require("supertest");
const app = require("../app"); // Adjust the path if needed
const Notification = require("../model/notification"); // Adjust the path if needed

describe("Notification API", () => {

    // Test for sending notification (Admin only)
    it("should send a notification", async () => {
        const notificationData = {
            title: "New Car Available",
            message: "A new car is now available for rent. Check it out!"
        };

        const response = await request(app)
            .post("/api/notification/send")
            .send(notificationData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Notification sent successfully.");
        expect(response.body.notification).toHaveProperty("title", "New Car Available");
        expect(response.body.notification).toHaveProperty("message", "A new car is now available for rent. Check it out!");
    });

    // Test for fetching all notifications
    it("should fetch all notifications", async () => {
        const response = await request(app).get("/api/notification/all");
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    // Test for deleting a notification
    it("should delete a notification", async () => {
        // Create a test notification first to delete
        const testNotification = new Notification({
            title: "Test Notification",
            message: "This is a test notification."
        });
        await testNotification.save();

        const response = await request(app).delete(`/api/notification/delete/${testNotification._id}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Notification deleted successfully.");

        // Verify the notification is deleted
        const deletedNotification = await Notification.findById(testNotification._id);
        expect(deletedNotification).toBeNull();
    });

});
