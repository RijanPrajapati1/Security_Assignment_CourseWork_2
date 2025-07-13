const request = require('supertest');
const app = require('../app'); // Your Express app
const mongoose = require('mongoose');
const Car = require('../model/car');
const fs = require('fs');
const path = require('path');

// Connect to test DB before tests
beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect('mongodb://localhost:27017/test_wheeloop', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to the test DB.");
    }
});

// Close DB connection after tests
afterAll(async () => {
    await mongoose.connection.close();
    console.log("Test DB cleaned and closed.");
});

// Cleanup Car Collection after each test
afterEach(async () => {
    await Car.deleteMany(); // Clears the cars collection after each test
});

// Test cases for Car API Routes
describe('Car API Routes', () => {
    // Test for Fetching All Cars
    it('should fetch all cars with image paths', async () => {
        const car = new Car({
            name: 'Toyota Prius',
            type: 'Sedan',
            price: '50000',
            description: 'A fuel-efficient car.',
            transmission: 'Automatic',
            image: 'sample-image.jpg'
        });

        await car.save();

        const response = await request(app).get('/api/car/findAll');
        expect(response.status).toBe(200);
        expect(response.body[0].name).toBe('Toyota Prius');
        expect(response.body[0].image).toBe('http://localhost:3001/car_images/sample-image.jpg');
    });

    // Test for Saving a Car with Image Upload
    it('should save a new car with an image', async () => {
        const imagePath = path.join(__dirname, 'sample-image.jpg'); // Provide an actual image file path
        const image = fs.readFileSync(imagePath);

        const response = await request(app)
            .post('/api/car')
            .attach('image', image, 'sample-image.jpg')
            .field('name', 'Honda Civic')
            .field('type', 'Sedan')
            .field('price', '25000')
            .field('description', 'A compact car.')
            .field('transmission', 'Manual')
            .expect(201);

        expect(response.body.name).toBe('Honda Civic');
        expect(response.body.image).toContain('sample-image.jpg');
    });

    // Test for Updating Car
    it('should update car details and keep the same image if no new image is provided', async () => {
        const car = new Car({
            name: 'Audi A4',
            type: 'Sedan',
            price: '40000',
            description: 'Luxury compact sedan.',
            transmission: 'Automatic',
            image: 'audi-a4.jpg'
        });

        await car.save();

        const updatedData = {
            name: 'Audi A4 2022',
            type: 'Sedan',
            price: '42000',
            description: 'Updated luxury compact sedan.',
            transmission: 'Automatic',
        };

        const response = await request(app)
            .put(`/api/car/${car._id}`)
            .send(updatedData)
            .expect(200);

        expect(response.body.name).toBe('Audi A4 2022');
        expect(response.body.image).toBe('http://localhost:3001/car_images/audi-a4.jpg');
    });

    // Test for Deleting Car
    it('should delete a car by ID', async () => {
        const car = new Car({
            name: 'Ford Focus',
            type: 'Hatchback',
            price: '18000',
            description: 'Compact hatchback.',
            transmission: 'Manual',
            image: 'ford-focus.jpg'
        });

        await car.save();

        const response = await request(app)
            .delete(`/api/car/${car._id}`)
            .expect(200);

        expect(response.body.message).toBe('Car deleted successfully');

        // Try to fetch the deleted car
        const deletedCarResponse = await request(app).get(`/api/car/${car._id}`).expect(404);
        expect(deletedCarResponse.body.message).toBe('Car not found');
    });
});
