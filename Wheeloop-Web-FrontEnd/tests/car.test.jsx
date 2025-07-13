// booking.test.js
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axiosInstance from '../utils/axios';
import Booking from './Booking'; // Adjust the import path accordingly

// Mock axiosInstance
jest.mock('../utils/axios');

// Mock localStorage
beforeAll(() => {
  Storage.prototype.getItem = jest.fn(() => 'userId123'); // Mock userId in localStorage
});

test('should load bookings, display correct data, handle no bookings, and user interaction', async () => {
  // Mock the API response
  axiosInstance.get.mockResolvedValue({
    data: [
      {
        _id: '1',
        carId: { name: 'Car 1', image: 'car1.jpg' },
        pickUpLocation: 'Location 1',
        startDate: '2025-03-01',
        endDate: '2025-03-05',
        status: 'confirmed',
      },
    ],
  });

  render(<Booking />);

  // Check if loading text is visible
  expect(screen.getByText('Loading your bookings...')).toBeInTheDocument();

  // Wait for bookings to load and table to appear
  await waitFor(() => expect(screen.getByText('Car 1')).toBeInTheDocument());

  // Check the booking details in the table
  expect(screen.getByText('Car 1')).toBeInTheDocument();
  expect(screen.getByText('Location 1')).toBeInTheDocument();
  expect(screen.getByText('2025-03-01')).toBeInTheDocument();
  expect(screen.getByText('2025-03-05')).toBeInTheDocument();
  expect(screen.getByText('confirmed')).toBeInTheDocument();

  // Click on the booking to select the car ID
  fireEvent.click(screen.getByText('Car 1'));

  // Check if the selected car ID is displayed
  expect(screen.getByText('Selected Car ID: 1')).toBeInTheDocument();

  // Test no bookings case
  axiosInstance.get.mockResolvedValue({ data: [] });

  render(<Booking />);

  // Check if "No bookings found" message is displayed
  await waitFor(() => expect(screen.getByText('No bookings found')).toBeInTheDocument());

  // Test error fetching bookings
  axiosInstance.get.mockRejectedValue(new Error('API error'));

  render(<Booking />);

  // Wait for the error message to appear
  await waitFor(() => expect(screen.getByText('Failed to load bookings. Please try again.')).toBeInTheDocument());
});
