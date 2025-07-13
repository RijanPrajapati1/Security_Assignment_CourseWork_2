import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import CarCard from './CarCard'; // Adjust the import path as needed
import CarListing from './CarListing'; // Adjust the import path as needed

// Mocking axios for API calls
jest.mock('axios');

// Test for CarCard Component
const car = {
    image: '/path/to/image.jpg',
    name: 'Tesla Model 3',
    type: 'Electric',
    capacity: 5,
    transmission: 'Automatic',
    mileage: 300,
    price: 500,
};

describe('CarCard Component', () => {
    test('renders car details correctly', () => {
        render(<CarCard car={car} onCardClick={() => { }} />);

        expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
        expect(screen.getByText('Electric')).toBeInTheDocument();
        expect(screen.getByText('5 4 People')).toBeInTheDocument();
        expect(screen.getByText('Automatic')).toBeInTheDocument();
        expect(screen.getByText('300 20 miles/day')).toBeInTheDocument();
        expect(screen.getByText('Rs.500/day')).toBeInTheDocument();
    });

    test('clicking the card triggers the onCardClick handler', () => {
        const handleClick = jest.fn();
        render(<CarCard car={car} onCardClick={handleClick} />);

        fireEvent.click(screen.getByText('Tesla Model 3'));
        expect(handleClick).toHaveBeenCalledWith(car);
    });
});

// Test for CarListing Component
describe('CarListing Component', () => {
    test('renders cars and handles search', async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                { _id: 1, name: 'Tesla Model 3', type: 'Electric', price: 500, image: '/path/to/image.jpg' },
                { _id: 2, name: 'BMW X5', type: 'SUV', price: 700, image: '/path/to/image2.jpg' },
            ],
        });

        render(<CarListing />);

        // Wait for cars to load
        await waitFor(() => screen.getByText('Tesla Model 3'));
        expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
        expect(screen.getByText('BMW X5')).toBeInTheDocument();

        // Simulate search
        const searchInput = screen.getByPlaceholderText('Search for cars...');
        fireEvent.change(searchInput, { target: { value: 'Tesla' } });

        // Ensure that the Tesla car is still visible
        expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
        expect(screen.queryByText('BMW X5')).not.toBeInTheDocument();
    });

    test('shows car details when a car is clicked', async () => {
        axios.get.mockResolvedValueOnce({
            data: [{ _id: 1, name: 'Tesla Model 3', type: 'Electric', price: 500, image: '/path/to/image.jpg' }],
        });

        render(<CarListing />);

        // Wait for car data to load
        await waitFor(() => screen.getByText('Tesla Model 3'));

        fireEvent.click(screen.getByText('Tesla Model 3'));

        expect(screen.getByText('Type: Electric')).toBeInTheDocument();
        expect(screen.getByText('Rs.500/day')).toBeInTheDocument();
    });

    test('opens booking form when "Book Now" is clicked', async () => {
        axios.get.mockResolvedValueOnce({
            data: [{ _id: 1, name: 'Tesla Model 3', type: 'Electric', price: 500, image: '/path/to/image.jpg' }],
        });

        render(<CarListing />);

        await waitFor(() => screen.getByText('Tesla Model 3'));

        fireEvent.click(screen.getByText('Tesla Model 3'));
        fireEvent.click(screen.getByText('Book Now'));

        // Check if booking form modal is visible
        expect(screen.getByText('Book Tesla Model 3')).toBeInTheDocument();
    });
});
