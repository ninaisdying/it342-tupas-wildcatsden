import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import BookingForm from '../features/booking/components/BookingForm';
import Bookings from '../features/booking/components/Bookings';
import CustodianBookings from '../features/custodian/components/CustodianBookings';

// Mock fetch and context
global.fetch = jest.fn();

// Mock the UserContext properly
jest.mock('../features/admin/components/UserContext.jsx', () => ({
  useUser: jest.fn(),
  UserContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children({ user: { userId: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }, login: jest.fn() })
  }
}));

const mockVenue = {
  venueId: 1,
  venueName: 'Conference Hall A',
  venueLocation: 'NGE',
  venueCapacity: 100,
  image: '/images/hall-a.jpg'
};

const mockBookings = [
  { 
    bookingId: 1, 
    venue: { venueId: 1, venueName: 'Conference Hall A' }, 
    date: '2024-12-15', 
    timeSlot: '10:00:00', 
    capacity: 50, 
    status: 'pending', 
    eventName: 'Team Meeting', 
    eventType: 'Meeting',
    user: { userId: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
  },
  { 
    bookingId: 2, 
    venue: { venueId: 2, venueName: 'Seminar Room B' }, 
    date: '2024-12-16', 
    timeSlot: '14:00:00', 
    capacity: 30, 
    status: 'approved', 
    eventName: 'Workshop', 
    eventType: 'Workshop',
    user: { userId: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
  }
];

// Mock venues for custodian
const mockVenues = [
  { venueId: 1, venueName: 'Conference Hall A' },
  { venueId: 2, venueName: 'Seminar Room B' }
];

describe('Booking Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Setup default mocks
    const { useUser } = require('../features/admin/components/UserContext.jsx');
    useUser.mockReturnValue({ 
      user: { userId: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
    });
  });

  describe('BookingForm', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
      // Mock the existing bookings check endpoint
      fetch.mockResolvedValue({
        ok: true,
        json: async () => []
      });
    });

    test('renders booking form correctly', () => {
      render(
        <BrowserRouter>
          <BookingForm venueId={1} venueData={mockVenue} onClose={mockOnClose} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Booking Form - Conference Hall A/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Event Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Event Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Start Time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/End Time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Expected Attendees/i)).toBeInTheDocument();
    });

    test('validates event name is required', async () => {
      render(
        <BrowserRouter>
          <BookingForm venueId={1} venueData={mockVenue} onClose={mockOnClose} />
        </BrowserRouter>
      );

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter an event name/i)).toBeInTheDocument();
      });
    });

    test('validates date must be future date', async () => {
      render(
        <BrowserRouter>
          <BookingForm venueId={1} venueData={mockVenue} onClose={mockOnClose} />
        </BrowserRouter>
      );

      const dateInput = screen.getByLabelText(/Date/i);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      fireEvent.change(dateInput, { target: { value: yesterdayStr } });
      fireEvent.blur(dateInput);

      await waitFor(() => {
        expect(screen.getByText(/Please select a future date/i)).toBeInTheDocument();
      });
    });

    test('validates attendees must be positive number', async () => {
      render(
        <BrowserRouter>
          <BookingForm venueId={1} venueData={mockVenue} onClose={mockOnClose} />
        </BrowserRouter>
      );

      const attendeesInput = screen.getByLabelText(/Expected Attendees/i);
      fireEvent.change(attendeesInput, { target: { value: '0' } });
      fireEvent.blur(attendeesInput);

      await waitFor(() => {
        expect(screen.getByText(/Attendees must be a positive number/i)).toBeInTheDocument();
      });
    });

    test('validates end time must be after start time', async () => {
      render(
        <BrowserRouter>
          <BookingForm venueId={1} venueData={mockVenue} onClose={mockOnClose} />
        </BrowserRouter>
      );

      const startTimeSelect = screen.getByLabelText(/Start Time/i);
      const endTimeSelect = screen.getByLabelText(/End Time/i);
      
      fireEvent.change(startTimeSelect, { target: { value: '14:00' } });
      fireEvent.change(endTimeSelect, { target: { value: '09:00' } });
      
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/End time must be later than start time/i)).toBeInTheDocument();
      });
    });

    test('validates duration cannot exceed 6 hours', async () => {
      render(
        <BrowserRouter>
          <BookingForm venueId={1} venueData={mockVenue} onClose={mockOnClose} />
        </BrowserRouter>
      );

      const startTimeSelect = screen.getByLabelText(/Start Time/i);
      const endTimeSelect = screen.getByLabelText(/End Time/i);
      
      fireEvent.change(startTimeSelect, { target: { value: '09:00' } });
      fireEvent.change(endTimeSelect, { target: { value: '22:00' } });
      
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Duration cannot exceed 6 hours/i)).toBeInTheDocument();
      });
    });

    test('submits booking successfully', async () => {
      // Mock the POST request for booking
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bookingId: 123 })
      });

      render(
        <BrowserRouter>
          <BookingForm venueId={1} venueData={mockVenue} onClose={mockOnClose} />
        </BrowserRouter>
      );

      await userEvent.type(screen.getByLabelText(/Event Name/i), 'Team Building');
      await userEvent.selectOptions(screen.getByLabelText(/Event Type/i), 'Workshop');
      
      const dateInput = screen.getByLabelText(/Date/i);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      fireEvent.change(dateInput, { target: { value: tomorrowStr } });
      
      await userEvent.selectOptions(screen.getByLabelText(/Start Time/i), '10:00');
      await userEvent.selectOptions(screen.getByLabelText(/End Time/i), '12:00');
      await userEvent.type(screen.getByLabelText(/Expected Attendees/i), '25');
      await userEvent.type(screen.getByLabelText(/Purpose \/ Description/i), 'Annual team building event');
      
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Booking submitted/i)).toBeInTheDocument();
      });
    });
  });

  describe('Bookings (User View)', () => {
    test('renders bookings page with tabs', async () => {
      // Mock the user bookings endpoint
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings
      });

      render(
        <BrowserRouter>
          <Bookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/My Bookings/i)).toBeInTheDocument();
      });
      
      await waitFor(() => {
        // Use getAllByText for elements that appear multiple times
        expect(screen.getAllByText('Upcoming')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Approved')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Rejected')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Canceled')[0]).toBeInTheDocument();
      });
    });

    test('displays bookings list', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings
      });

      render(
        <BrowserRouter>
          <Bookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Conference Hall A')).toBeInTheDocument();
        expect(screen.getByText('Seminar Room B')).toBeInTheDocument();
      });
      
      // Team Meeting appears in the event-type div
      await waitFor(() => {
        expect(screen.getByText(/Team Meeting/i)).toBeInTheDocument();
        expect(screen.getByText(/Workshop/i)).toBeInTheDocument();
      });
    });

    test('shows cancel button for pending bookings', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings
      });

      render(
        <BrowserRouter>
          <Bookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        // There should be a cancel button for the pending booking
        const cancelButtons = screen.getAllByText('Cancel Booking');
        expect(cancelButtons.length).toBeGreaterThan(0);
      });
    });

    test('handles booking cancellation', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings
      });

      // Mock the cancellation request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      render(
        <BrowserRouter>
          <Bookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        const cancelButton = screen.getAllByText('Cancel Booking')[0];
        fireEvent.click(cancelButton);
      });

      // Look for the confirmation modal or success message
      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
    });
  });

  describe('CustodianBookings', () => {
    test('renders custodian bookings view', async () => {
      // Mock venues fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenues
      });
      
      // Mock bookings fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings
      });

      render(
        <BrowserRouter>
          <CustodianBookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Venue Bookings/i)).toBeInTheDocument();
      });
      
      await waitFor(() => {
        // Use getAllByText for tab buttons
        expect(screen.getAllByText('Pending')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Approved')[0]).toBeInTheDocument();
      });
    });

    test('shows accept/reject buttons for pending bookings', async () => {
      // Mock venues fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenues
      });
      
      // Mock bookings fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings
      });

      render(
        <BrowserRouter>
          <CustodianBookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Accept')).toBeInTheDocument();
        expect(screen.getByText('Reject')).toBeInTheDocument();
      });
    });

    test('handles booking approval', async () => {
      // Mock venues fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVenues
      });
      
      // Mock bookings fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookings
      });

      // Mock approval request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      render(
        <BrowserRouter>
          <CustodianBookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        const acceptButton = screen.getByText('Accept');
        fireEvent.click(acceptButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Booking approved successfully/i)).toBeInTheDocument();
      });
    });
  });
});