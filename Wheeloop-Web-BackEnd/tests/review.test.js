const request = require("supertest");
const app = require("../app"); // Adjust the path if needed
const Review = require("../model/review"); // Adjust the path if needed
const User = require("../model/user"); // Adjust the path if needed
const Car = require("../model/car"); // Adjust the path if needed

describe("Review API", () => {

    let userId, carId, reviewId;

    beforeAll(async () => {
        // Create a mock user and car for testing
        const user = new User({ name: "Test User" });
        await user.save();
        userId = user._id;

        const car = new Car({ name: "Test Car" });
        await car.save();
        carId = car._id;
    });

    afterAll(async () => {
        // Clean up after tests
        await Review.deleteMany({});
        await User.deleteMany({});
        await Car.deleteMany({});
    });

    // Test for submitting or updating a review
    it("should submit a review", async () => {
        const reviewData = {
            userId,
            carId,
            reviewText: "Great car, really enjoyed it!"
        };

        const response = await request(app)
            .post("/api/review/submit")
            .send(reviewData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Review submitted successfully.");

        // Save reviewId for further testing
        reviewId = response.body.review._id;
    });

    // Test for getting all reviews for a specific car
    it("should fetch all reviews for a car", async () => {
        const response = await request(app).get(`/api/review/car/${carId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.reviews).toBeInstanceOf(Array);
    });

    // Test for getting a user's review for a specific car
    it("should fetch a user's review for a car", async () => {
        const response = await request(app).get(`/api/review/user/${userId}/car/${carId}`);

        expect(response.status).toBe(200);
        expect(response.body.reviewText).toBe("Great car, really enjoyed it!");
    });

    // Test for fetching all reviews
    it("should fetch all reviews", async () => {
        const response = await request(app).get("/api/review/all");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.reviews).toBeInstanceOf(Array);
    });

    // Test for updating a review
    it("should update a review", async () => {
        const updatedReviewData = {
            reviewText: "Great car, will rent again!"
        };

        const response = await request(app)
            .put(`/api/review/update/${reviewId}`)
            .send(updatedReviewData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.updatedReview.reviewText).toBe("Great car, will rent again!");
    });

    // Test for deleting a review
    it("should delete a review", async () => {
        const response = await request(app).delete(`/api/review/delete/${reviewId}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Review deleted.");

        // Verify the review is deleted
        const deletedReview = await Review.findById(reviewId);
        expect(deletedReview).toBeNull();
    });

});
