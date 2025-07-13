const request = require('supertest');
const app = require('../app'); // Import your Express app
const mongoose = require('mongoose');
const Cred = require('../model/cred');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "8261ba19898d0dcdfe6c0c411df74b587b2e54538f5f451633b71e39f957cf01";

let token; // This will hold the JWT token for authentication tests

beforeAll(async () => {
    // Connect only once before all tests
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://localhost:27017/test_wheeloop', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to the test DB.");
    }
});

afterAll(async () => {
    // Close the database connection after all tests are done
    await mongoose.connection.close();
    console.log("Test DB cleaned and closed.");
});

// Test for user registration
describe('POST /api/cred/register', () => {
    // it('should register a new user successfully', async () => {
    //     const newUser = {
    //         email: 'testuser@example.com',
    //         password: 'password123',
    //         full_name: 'Test User',
    //         address: '123 Test Street',
    //         phone_number: '1234567890'
    //     };

    //     // const response = await request(app)
    //     //     .post('/api/cred/register')
    //     //     .send(newUser)
    //     //     .expect(201);

    //     expect(response.body.message).toBe('You have successfully registered.');
    //     expect(response.body.user.email).toBe(newUser.email);
    // });

    it('should fail if the email is already registered', async () => {
        const existingUser = {
            email: 'testuser@example.com',
            password: 'password123',
            full_name: 'Test User',
            address: '123 Test Street',
            phone_number: '1234567890'
        };

        // // First, register a user
        // await request(app)
        //     .post('/api/cred/register')
        //     .send(existingUser);

        // Try registering again with the same email
        const response = await request(app)
            .post('/api/cred/register')
            .send(existingUser)
            .expect(400);

        expect(response.text).toBe('Email already registered.');
    });
});

// Test for user login
describe('POST /api/cred/login', () => {
    it('should log in successfully and return a JWT token', async () => {
        const userLogin = {
            email: 'testuser@example.com',
            password: 'password123'
        };

        // Ensure the user is registered
        await request(app)
            .post('/api/cred/register')
            .send(userLogin);

        const response = await request(app)
            .post('/api/cred/login')
            .send(userLogin)
            .expect(200);

        expect(response.body.token).toBeDefined();  // Token should be returned
        token = response.body.token;  // Store the token for further tests
        expect(response.body.role).toBe('customer'); // Assuming "customer" is the default role
    });

    it('should fail with incorrect credentials', async () => {
        const invalidLogin = {
            email: 'testuser@example.com',
            password: 'wrongpassword'
        };

        const response = await request(app)
            .post('/api/cred/login')
            .send(invalidLogin)
            .expect(403);

        expect(response.text).toBe('Invalid email or password');
    });
});

// Test for email verification
describe('GET /api/cred/verify-email', () => {
    it('should fail with an invalid or expired token', async () => {
        const response = await request(app)
            .get('/api/cred/verify-email?token=invalidtoken')
            .expect(400);

        expect(response.text).toBe('Invalid or expired token.');
    });
});
