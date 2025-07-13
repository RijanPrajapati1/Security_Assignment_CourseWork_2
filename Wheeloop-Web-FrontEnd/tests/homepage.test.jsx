import '@testing-library/jest-dom/extend-expect'; // For additional matchers
import { fireEvent, render, screen } from '@testing-library/react';
import HomePage from '../HomePage'; // Adjust the path according to your folder structure

// Mock the external libraries and components
jest.mock('aos', () => ({
    init: jest.fn(),
}));

jest.mock('../Navbar/navbar', () => () => <div>Navbar</div>);

describe('HomePage Component', () => {
    test('renders the homepage with correct content', () => {
        // Render the component
        render(<HomePage />);

        // Check for static text elements
        expect(screen.getByText('WHEELOOP')).toBeInTheDocument();
        expect(screen.getByText('Rent. Ride. Repeat.')).toBeInTheDocument();
        expect(screen.getByText(/Discover seamless car rentals/)).toBeInTheDocument();
        expect(screen.getByText('Get Started')).toBeInTheDocument();

        // Check the service section content
        expect(screen.getByText('Our Services')).toBeInTheDocument();
        expect(screen.getByText('Compact Car')).toBeInTheDocument();
        expect(screen.getByText('SUV')).toBeInTheDocument();
        expect(screen.getByText('Luxury')).toBeInTheDocument();

        // Check the About section
        expect(screen.getByText('About Wheeloop')).toBeInTheDocument();
        expect(screen.getByText(/Wheeloop offers a diverse fleet/)).toBeInTheDocument();

        // Check the Contact section
        expect(screen.getByText('Contact Us')).toBeInTheDocument();
        expect(screen.getByText('support@wheeloop.com')).toBeInTheDocument();
        expect(screen.getByText('9812345678')).toBeInTheDocument();
        expect(screen.getByText('Bhaktapur, Kathmandu, Nepal')).toBeInTheDocument();
    });

    test('navigates to the car list page when "Get Started" button is clicked', () => {
        // Render the component
        render(<HomePage />);

        // Simulate button click
        const button = screen.getByText('Get Started');
        fireEvent.click(button);

        // Check if the navigation happens (you can check if the location changes)
        expect(window.location.href).toBe('http://localhost/carlists');
    });
});
