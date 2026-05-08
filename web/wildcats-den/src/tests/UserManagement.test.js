// tests/UserManagement.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import UserManagement from '../features/admin/components/UserManagement';
import UserAddModal from '../features/auth/components/UserAddModal';
import UserEditModal from '../features/admin/components/UserEditModal';

global.fetch = jest.fn();

const mockUsers = {
  content: [
    { userId: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', userType: 'Student' },
    { userId: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', userType: 'Faculty' },
    { userId: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', userType: 'Coordinator' }
  ],
  totalPages: 1
};

// Helper to create a mock fetch response with clone method
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

describe('User Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserManagement Main Component', () => {
    test('renders user management table', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockUsers));

      render(
        <BrowserRouter>
          <UserManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
      });
    });

    test('filters users by search query', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockUsers));

      render(
        <BrowserRouter>
          <UserManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search users...');
        fireEvent.change(searchInput, { target: { value: 'John' } });
        
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    test('filters users by role', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockUsers));

      render(
        <BrowserRouter>
          <UserManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        const roleFilter = document.querySelector('.usf-filter');
        expect(roleFilter).toBeInTheDocument();
        fireEvent.change(roleFilter, { target: { value: 'Student' } });
        
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    test('opens add user modal when Add User button clicked', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockUsers));

      render(
        <BrowserRouter>
          <UserManagement />
        </BrowserRouter>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });

      // Find and click the Add User button using querySelector
      const addButton = document.querySelector('.usf-btn-add');
      expect(addButton).toBeInTheDocument();
      fireEvent.click(addButton);

      // Verify modal opened - the modal title "Add User" appears
      await waitFor(() => {
        const modalTitle = screen.getByRole('heading', { name: 'Add User' });
        expect(modalTitle).toBeInTheDocument();
      });
    });

    test('opens edit modal when Edit button clicked', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockUsers));

      render(
        <BrowserRouter>
          <UserManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        fireEvent.click(editButtons[0]);
        
        expect(screen.getByText('Edit User')).toBeInTheDocument();
      });
    });

    test('selects multiple users for bulk delete', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockUsers));

      render(
        <BrowserRouter>
          <UserManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]);
        fireEvent.click(checkboxes[2]);
        
        const deleteButton = screen.getByText('Delete Selected');
        expect(deleteButton).not.toBeDisabled();
      });
    });

    test('shows delete confirmation modal for single user', async () => {
      fetch.mockImplementationOnce(() => createMockResponse(mockUsers));

      render(
        <BrowserRouter>
          <UserManagement />
        </BrowserRouter>
      );

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);
        
        expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
      });
    });
  });

  describe('UserAddModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();

    beforeEach(() => {
      fetch.mockReset();
    });

    test('renders add user form', () => {
      render(
        <UserAddModal onClose={mockOnClose} onSave={mockOnSave} />
      );

      expect(screen.getByText('Add User')).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    });

    test('shows student fields when Student role selected', async () => {
      render(
        <UserAddModal onClose={mockOnClose} onSave={mockOnSave} />
      );

      const roleSelect = screen.getByLabelText(/Role/i);
      await userEvent.selectOptions(roleSelect, 'Student');

      await waitFor(() => {
        expect(screen.getByLabelText(/Course/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Organization/i)).toBeInTheDocument();
      });
    });

    test('shows coordinator fields when Coordinator role selected', async () => {
      render(
        <UserAddModal onClose={mockOnClose} onSave={mockOnSave} />
      );

      const roleSelect = screen.getByLabelText(/Role/i);
      await userEvent.selectOptions(roleSelect, 'Coordinator');

      await waitFor(() => {
        expect(screen.getByLabelText(/Affiliation/i)).toBeInTheDocument();
      });
    });

    test('shows faculty fields when Faculty role selected', async () => {
      render(
        <UserAddModal onClose={mockOnClose} onSave={mockOnSave} />
      );

      const roleSelect = screen.getByLabelText(/Role/i);
      await userEvent.selectOptions(roleSelect, 'Faculty');

      await waitFor(() => {
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
      });
    });

    test('submits user creation successfully', async () => {
      // Mock the fetch for user creation with proper clone method
      fetch.mockImplementationOnce(() => createMockResponse({ userId: 4, firstName: 'New', lastName: 'User', email: 'new@example.com' }));

      render(
        <UserAddModal onClose={mockOnClose} onSave={mockOnSave} />
      );

      await userEvent.type(screen.getByLabelText(/First Name/i), 'New');
      await userEvent.type(screen.getByLabelText(/Last Name/i), 'User');
      await userEvent.type(screen.getByLabelText(/Email/i), 'new@example.com');
      
      const roleSelect = screen.getByLabelText(/Role/i);
      await userEvent.selectOptions(roleSelect, 'Student');
      
      // Wait for student fields to appear
      await waitFor(() => {
        expect(screen.getByLabelText(/Course/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Organization/i)).toBeInTheDocument();
      });
      
      await userEvent.type(screen.getByLabelText(/Course/i), 'BSIT');
      await userEvent.type(screen.getByLabelText(/Organization/i), 'CCS');
      
      // Find and click the submit button
      const submitButton = screen.getByRole('button', { name: /Create User/i });
      fireEvent.click(submitButton);

      // Wait for the save to complete
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockOnSave).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('UserEditModal', () => {
    const mockEditData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      userType: 'Student',
      about: 'Student info',
      location: 'Manila'
    };
    const mockSetEditData = jest.fn();
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();

    test('renders edit form with existing data', () => {
      render(
        <UserEditModal 
          editData={mockEditData}
          setEditData={mockSetEditData}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Student')).toBeInTheDocument();
    });

    test('updates form fields on change', async () => {
      render(
        <UserEditModal 
          editData={mockEditData}
          setEditData={mockSetEditData}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const firstNameInput = screen.getByDisplayValue('John');
      await userEvent.clear(firstNameInput);
      await userEvent.type(firstNameInput, 'Jonathan');

      expect(mockSetEditData).toHaveBeenCalled();
    });

    test('saves changes when Save button clicked', () => {
      render(
        <UserEditModal 
          editData={mockEditData}
          setEditData={mockSetEditData}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalled();
    });
  });
});