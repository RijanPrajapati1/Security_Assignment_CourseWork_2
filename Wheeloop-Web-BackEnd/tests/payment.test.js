const request = require('supertest');
const app = require('./app');  // Adjust path as needed

describe('Payment API Tests', () => {

    // Test for processing payment
    it('should process payment successfully', async () => {
        const paymentData = {
            bookingId: "validBookingId",  // Replace with actual booking ID
            userId: "validUserId",        // Replace with actual user ID
            totalAmount: 200,
            paymentMethod: "card",
            transactionId: "txn12345",
            cardNumber: "1234567812345678",
            expiryDate: "12/23",
            cardHolderName: "John Doe"
        };

        const response = await request(app).post('/api/payment/process').send(paymentData);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Payment processed successfully.");
    });

    // Test for fetching payments by user ID
    it('should fetch payments for a user', async () => {
        const userId = "validUserId";  // Replace with actual user ID
        const response = await request(app).get(`/api/payment/user/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    // Test for updating payment status (admin-only)
    it('should update payment status', async () => {
        const paymentId = "validPaymentId";  // Replace with actual payment ID
        const updateData = { paymentStatus: "completed" };

        const response = await request(app).put(`/api/payment/update/${paymentId}`).send(updateData);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    // Test for deleting a payment (admin-only)
    it('should delete a payment', async () => {
        const paymentId = "validPaymentId";  // Replace with actual payment ID
        const response = await request(app).delete(`/api/payment/delete/${paymentId}`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

});
