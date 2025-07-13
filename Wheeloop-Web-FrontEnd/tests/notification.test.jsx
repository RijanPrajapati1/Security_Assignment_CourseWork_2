import '@testing-library/jest-dom/extend-expect'; // For additional matchers
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import NotificationPanel from '../NotificationPanel'; // Adjust path based on your folder structure

// Mock Axios instance
const mockAxios = new MockAdapter(axios);

describe('NotificationPanel Component', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockAxios.reset();
    });

    test('renders the notification panel and displays notifications', async () => {
        // Mock the API response
        mockAxios.onGet('/notification/all').reply(200, {
            notifications: [
                { _id: '1', title: 'New Car Available', message: 'A new car has been added to the fleet.', isNew: true },
                { _id: '2', title: 'Booking Reminder', message: 'Your booking is due soon.', isNew: false },
            ],
        });

        render(<NotificationPanel />);

        // Wait for the notifications to load
        await waitFor(() => screen.getByText('New Car Available'));

        // Check if notifications are displayed
        expect(screen.getByText('New Car Available')).toBeInTheDocument();
        expect(screen.getByText('Booking Reminder')).toBeInTheDocument();

        // Check if the "New" label is shown for the new notification
        expect(screen.getByText('New')).toBeInTheDocument();
    });

    test('marks a notification as read when clicked', async () => {
        // Mock the API responses
        mockAxios.onGet('/notification/all').reply(200, {
            notifications: [
                { _id: '1', title: 'New Car Available', message: 'A new car has been added to the fleet.', isNew: true },
            ],
        });
        mockAxios.onPut('/notification/markAsRead/1').reply(200, {});

        render(<NotificationPanel />);

        // Wait for the notification to appear
        await waitFor(() => screen.getByText('New Car Available'));

        // Click on the notification
        const notificationItem = screen.getByText('New Car Available').closest('li');
        fireEvent.click(notificationItem);

        // Check if the "New" label is removed after clicking
        await waitFor(() => expect(notificationItem).not.toContainElement(screen.getByText('New')));
    });

    test('displays a message if no notifications are available', async () => {
        // Mock the API response with an empty notifications array
        mockAxios.onGet('/notification/all').reply(200, {
            notifications: [],
        });

        render(<NotificationPanel />);

        // Check if the "No notifications available" message is shown
        expect(screen.getByText('No notifications available.')).toBeInTheDocument();
    });
});
