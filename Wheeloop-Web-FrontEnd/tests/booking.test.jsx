import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axiosInstance from '../utils/axios'; // Adjust the import path as needed
import Booking from './Booking'; // Adjust the import path as needed

// Mocking axiosInstance for API calls
jest.mock('../utils/axios');

// Sample booking data for testing
const mockBookings = [
    {
        _id: '1',
        carId: { image: '/path/to/image.jpg', name: 'Tesla Model 3' },
        pickUpLocation: 'New York',
        startDate: '2025-03-01T10:00:00Z',
        endDate: '2025-03-07T10:00:00Z',
        status: 'confirmed',
    },
    {
        _id: '2',
        carId: { image: '/path/to/image2.jpg', name: 'BMW X5' },
        pickUpLocation: 'San Francisco',
        startDate: '2025-03-10T10:00:00Z',
        endDate: '2025-03-15T10:00:00Z',
        status: 'pending',
    },
];

describe('Booking Component', () => {
    test('renders loading state and fetches bookings successfully', async () => {
        axiosInstance.get.mockResolvedValueOnce({ data: mockBookings });

        render(<Booking />);

        // Check if loading state is displayed
        expect(screen.getByText('Loading your bookings...')).toBeInTheDocument();

        // Wait for bookings to load
        await waitFor(() => screen.getByText('Tesla Model 3'));

        // Check if the booking data is displayed correctly
        expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
        expect(screen.getByText('BMW X5')).toBeInTheDocument();
    });

    test('renders error message when fetch fails', async () => {
        axiosInstance.get.mockRejectedValueOnce(new Error('Failed to fetch'));

        render(<Booking />);

        // Wait for error message to appear
        await waitFor(() => screen.getByText('Failed to load bookings. Please try again.'));

        // Check if error message is displayed
        expect(screen.getByText('Error: Failed to load bookings. Please try again.')).toBeInTheDocument();
    });

    test('displays no bookings found when no bookings are returned', async () => {
        axiosInstance.get.mockResolvedValueOnce({ data: [] });

        render(<Booking />);

        // Wait for loading to finish
        await waitFor(() => screen.getByText('No bookings found'));

        // Check if "No bookings found" message is displayed
        expect(screen.getByText('No bookings found')).toBeInTheDocument();
    });

    test('displays car ID when a booking is clicked', async () => {
        axiosInstance.get.mockResolvedValueOnce({ data: mockBookings });

        render(<Booking />);

        // Wait for bookings to load
        await waitFor(() => screen.getByText('Tesla Model 3'));

        // Simulate clicking a booking
        fireEvent.click(screen.getByText('Tesla Model 3'));

        // Check if the selected car ID is displayed
        expect(screen.getByText('Selected Car ID: 1')).toBeInTheDocument();
    });
});
