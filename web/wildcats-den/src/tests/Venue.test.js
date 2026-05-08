import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// IMPORTANT: Mock UserContext BEFORE importing components that use it
jest.mock('../features/admin/components/UserContext.jsx', () => {
  const React = require('react');
  const mockUser = { userId: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' };
  const mockContextValue = {
    user: mockUser,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    updateUser: jest.fn(),
    updateUserPhoto: jest.fn(),
    isCustodian: false,
    isAdmin: false
  };
  
  return {
    UserContext: React.createContext(mockContextValue),
    useUser: jest.fn(() => mockContextValue),
    UserProvider: ({ children }) => React.createElement(React.Fragment, null, children)
  };
});

// Mock useParams and useNavigate BEFORE importing components
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

// Now import components after mocks are set up
import VenuesGrid from '../features/venues/components/VenuesGrid';
import VenueDetails from '../features/venues/components/VenueDetails';
import VenueOverview from '../features/venues/components/VenueOverview';

// Mock fetch
global.fetch = jest.fn();

// Helper to create mock fetch response
const createMockResponse = (data, ok = true, status = 200) => {
  const response = {
    ok,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    clone: jest.fn().mockReturnThis(),
    headers: new Headers({ 'content-type': 'application/json' })
  };
  return Promise.resolve(response);
};

const mockVenues = [
  { venueId: 1, venueName: 'Conference Hall A', venueLocation: 'NGE', venueCapacity: 100, image: '/images/hall-a.jpg', custodianName: 'John Smith' },
  { venueId: 2, venueName: 'Seminar Room B', venueLocation: 'SAL', venueCapacity: 50, image: '/images/room-b.jpg', custodianName: 'Jane Doe' },
  { venueId: 3, venueName: 'Auditorium', venueLocation: 'GLE', venueCapacity: 200, image: '/images/auditorium.jpg', custodianName: 'Bob Johnson' }
];

describe('Venue Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('VenuesGrid', () => {
    test('renders loading state initially', () => {
      fetch.mockImplementationOnce(() => new Promise(() => {}));
      
      render(
        <BrowserRouter>
          <VenuesGrid searchQuery="" showFilters={false} filters={{}} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Loading venues/i)).toBeInTheDocument();
    });

    test('renders venues after successful fetch', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockVenues));

      render(
        <BrowserRouter>
          <VenuesGrid searchQuery="" showFilters={false} filters={{}} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Conference Hall A')).toBeInTheDocument();
        expect(screen.getByText('Seminar Room B')).toBeInTheDocument();
        expect(screen.getByText('Auditorium')).toBeInTheDocument();
      });
    });

    test('filters venues by search query', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockVenues));

      render(
        <BrowserRouter>
          <VenuesGrid searchQuery="Conference" showFilters={false} filters={{}} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Conference Hall A')).toBeInTheDocument();
        expect(screen.queryByText('Seminar Room B')).not.toBeInTheDocument();
      });
    });

    test('shows no results message when no venues match', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockVenues));

      render(
        <BrowserRouter>
          <VenuesGrid searchQuery="NonExistentVenue" showFilters={false} filters={{}} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No venues match your search/i)).toBeInTheDocument();
      });
    });

    test('handles fetch error gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <BrowserRouter>
          <VenuesGrid searchQuery="" showFilters={false} filters={{}} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No venues available/i)).toBeInTheDocument();
      });
    });
  });

  describe('VenueDetails', () => {
    const mockVenue = {
      venueId: 1,
      venueName: 'Conference Hall A',
      venueLocation: 'NGE',
      venueCapacity: 100,
      description: 'A spacious conference hall',
      amenities: ['WiFi', 'Projector', 'Air Conditioner'],
      image: '/images/hall-a.jpg',
      custodianName: 'John Smith',
      custodianId: 1
    };

    test('fetches and displays venue details', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockVenue));

      render(
        <BrowserRouter>
          <VenueDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Conference Hall A')).toBeInTheDocument();
        expect(screen.getByText('NGE')).toBeInTheDocument();
        expect(screen.getByText(/100 people/i)).toBeInTheDocument();
      });
    });

    test('shows amenities list', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockVenue));

      render(
        <BrowserRouter>
          <VenueDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('WiFi')).toBeInTheDocument();
        expect(screen.getByText('Projector')).toBeInTheDocument();
        expect(screen.getByText('Air Conditioner')).toBeInTheDocument();
      });
    });

    test('shows error when venue not found', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(null, false, 404));

      render(
        <BrowserRouter>
          <VenueDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Venue Not Found/i)).toBeInTheDocument();
      });
    });
  });

  describe('VenueOverview (Admin)', () => {
    test('renders venue management table', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockVenues));

      render(
        <BrowserRouter>
          <VenueOverview />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Venue Management')).toBeInTheDocument();
        expect(screen.getByText('Conference Hall A')).toBeInTheDocument();
        expect(screen.getByText('Seminar Room B')).toBeInTheDocument();
      });
    });

    test('filters venues by location', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockVenues));

      render(
        <BrowserRouter>
          <VenueOverview />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Use getAllByText and get the button (not the table cell)
        const ngeButtons = screen.getAllByText('NGE');
        const ngeFilterButton = ngeButtons[0]; // First is the filter button
        fireEvent.click(ngeFilterButton);
        
        expect(screen.getByText('Conference Hall A')).toBeInTheDocument();
        expect(screen.queryByText('Seminar Room B')).not.toBeInTheDocument();
      });
    });

    test('opens add venue modal when Add Venue button clicked', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockVenues));

      render(
        <BrowserRouter>
          <VenueOverview />
        </BrowserRouter>
      );

      await waitFor(() => {
        const addButton = screen.getByText('+ Add Venue');
        fireEvent.click(addButton);
        
        expect(screen.getByText('Add New Venue')).toBeInTheDocument();
      });
    });

    test('opens edit modal when Edit button clicked', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockVenues));

      render(
        <BrowserRouter>
          <VenueOverview />
        </BrowserRouter>
      );

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
        
        expect(screen.getByText('Edit Venue')).toBeInTheDocument();
      });
    });

    test('shows delete confirmation modal', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockVenues));

      render(
        <BrowserRouter>
          <VenueOverview />
        </BrowserRouter>
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
        
        expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
      });
    });
  });
});