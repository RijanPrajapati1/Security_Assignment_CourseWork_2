const request = require('supertest');
const app = require('../app'); // Import your Express app
const mongoose = require('mongoose');
const Rental = require('../model/rental'); // Assuming you have a Rental model

beforeAll(async () => {
    // Connect only once before all tests
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://localhost:27017/test_wheeloop', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to the test DB.");
    }
});

afterAll(async () => {
    // Close the database connection after all tests are done
    await mongoose.connection.db.dropDatabase(); // Clean up the test database
    await mongoose.connection.close();
    console.log("Test DB cleaned and closed.");
});

// Test for creating a rental booking
describe('POST /api/rental', () => {
    it('should create a rental booking successfully', async () => {
        const rentalData = {
            car_id: '1234567890abcdef',
            user_id: 'abcdef1234567890',
            start_date: '2025-03-01',
            end_date: '2025-03-10',
            total_price: 250
        };

        const response = await request(app)
            .post('/api/rental')  // Correct path for booking a rental
            .send(rentalData)
            .expect(201);

        expect(response.body.message).toBe('Booking created successfully.');
        expect(response.body.rental.car_id).toBe(rentalData.car_id);
    });

    it('should fail if the car is not available for the requested dates', async () => {
        const rentalData = {
            car_id: '1234567890abcdef',
            user_id: 'abcdef1234567890',
            start_date: '2025-03-01',
            end_date: '2025-03-10',
            total_price: 250
        };

        // Assume the car is already booked for the dates
        const response = await request(app)
            .post('/api/rental')  // Correct path for booking a rental
            .send(rentalData)
            .expect(400);

        expect(response.text).toBe('Car is not available for the selected dates.');
    });
});

// Test for viewing user bookings
describe('GET /api/rental/userBookings', () => {
    it('should retrieve a list of user bookings', async () => {
        const response = await request(app)
            .get('/api/rental/userBookings')  // Correct path for retrieving user bookings
            .expect(200);

        expect(Array.isArray(response.body.bookings)).toBe(true);
        expect(response.body.bookings.length).toBeGreaterThan(0);
    });
});

// Test for viewing admin bookings
describe('GET /api/rental/adminBookings', () => {
    it('should retrieve a list of admin bookings', async () => {
        const response = await request(app)
            .get('/api/rental/adminBookings')  // Correct path for retrieving admin bookings
            .expect(200);

        expect(Array.isArray(response.body.bookings)).toBe(true);
        expect(response.body.bookings.length).toBeGreaterThan(0);
    });
});

// Test for updating rental booking status
describe('PUT /api/rental/updateBooking/:id', () => {
    it('should update the rental status successfully', async () => {
        const rentalId = '60b8d1c4f1d1c2f5a5a4a4b1'; // Example rental ID
        const updatedData = {
            status: 'approved'
        };

        const response = await request(app)
            .put(`/api/rental/updateBooking/${rentalId}`)  // Correct path for updating booking
            .send(updatedData)
            .expect(200);

        expect(response.body.message).toBe('Rental status updated successfully.');
        expect(response.body.rental.status).toBe('approved');
    });

    it('should fail if rental not found', async () => {
        const rentalId = 'nonexistentrentalid';
        const updatedData = {
            status: 'approved'
        };

        const response = await request(app)
            .put(`/api/rental/updateBooking/${rentalId}`)  // Correct path for updating booking
            .send(updatedData)
            .expect(404);

        expect(response.text).toBe('Rental not found.');
    });
});

// Test for rental booking cancellation
describe('DELETE /api/rental/deleteBooking/:id', () => {
    it('should cancel a rental booking successfully', async () => {
        const rentalId = '60b8d1c4f1d1c2f5a5a4a4b1'; // Example rental ID

        const response = await request(app)
            .delete(`/api/rental/deleteBooking/${rentalId}`)  // Correct path for canceling booking
            .expect(200);

        expect(response.body.message).toBe('Rental booking canceled successfully.');
    });

    it('should fail if rental not found', async () => {
        const rentalId = 'nonexistentrentalid';

        const response = await request(app)
            .delete(`/api/rental/deleteBooking/${rentalId}`)  // Correct path for canceling booking
            .expect(404);

        expect(response.text).toBe('Rental not found.');
    });
});
