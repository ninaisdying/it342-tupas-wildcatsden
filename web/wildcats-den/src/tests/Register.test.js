// tests/Register.test.js
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SignUpModal from '../features/auth/components/SignUpModal';

// Mock the API
jest.mock('../api/api', () => ({
  authAPI: {
    signUp: jest.fn()
  }
}));

describe('Register Component', () => {
  const mockOnClose = jest.fn();
  const mockOpenSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { authAPI } = require('../api/api');
    authAPI.signUp.mockReset();
  });

  test('renders registration form correctly', () => {
    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password(?!\s*Confirm)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    const emailInput = screen.getByLabelText(/Email/i);
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  test('validates password length', async () => {
    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    const passwordInput = screen.getByLabelText(/^Password(?!\s*Confirm)/i);
    await userEvent.type(passwordInput, 'short');
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  test('validates password confirmation match', async () => {
    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    await userEvent.type(screen.getByLabelText(/^Password(?!\s*Confirm)/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'different123');
    fireEvent.blur(screen.getByLabelText(/Confirm Password/i));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('shows student-specific fields when Student role selected', async () => {
    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    const roleSelect = screen.getByLabelText(/Role/i);
    await userEvent.selectOptions(roleSelect, 'Student');

    await waitFor(() => {
      expect(screen.getByLabelText(/Course/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/Organization/i)).toBeInTheDocument();
    });
  });

  test('shows coordinator-specific fields when Coordinator role selected', async () => {
    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    const roleSelect = screen.getByLabelText(/Role/i);
    await userEvent.selectOptions(roleSelect, 'Coordinator');

    await waitFor(() => {
      expect(screen.getByLabelText(/Affiliation/i)).toBeInTheDocument();
    });
  });

  test('shows faculty-specific fields when Faculty role selected', async () => {
    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    const roleSelect = screen.getByLabelText(/Role/i);
    await userEvent.selectOptions(roleSelect, 'Faculty');

    await waitFor(() => {
      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });
  });

  test('handles successful registration', async () => {
    const { authAPI } = require('../api/api');
    
    authAPI.signUp.mockResolvedValue({ userId: 4, email: 'newuser@example.com' });

    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    await userEvent.type(screen.getByLabelText(/First Name/i), 'New');
    await userEvent.type(screen.getByLabelText(/Last Name/i), 'User');
    await userEvent.type(screen.getByLabelText(/Email/i), 'newuser@example.com');
    await userEvent.type(screen.getByLabelText(/^Password(?!\s*Confirm)/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');
    
    const roleSelect = screen.getByLabelText(/Role/i);
    await userEvent.selectOptions(roleSelect, 'Student');
    
    await userEvent.type(screen.getByLabelText(/Course/i), 'BSIT');
    await userEvent.type(screen.getByLabelText(/Organization/i), 'CCS');
    
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Account created successfully/i)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOpenSignIn).toHaveBeenCalled();
    });
  });

  test('displays error message on failed registration - duplicate email', async () => {
    const { authAPI } = require('../api/api');
    
    authAPI.signUp.mockRejectedValue(new Error('Email already exists'));

    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
    await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/Email/i), 'existing@example.com');
    await userEvent.type(screen.getByLabelText(/^Password(?!\s*Confirm)/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');
    
    const roleSelect = screen.getByLabelText(/Role/i);
    await userEvent.selectOptions(roleSelect, 'Student');
    
    await userEvent.type(screen.getByLabelText(/Course/i), 'BSIT');
    await userEvent.type(screen.getByLabelText(/Organization/i), 'CCS');
    
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    // Use getAllByText since there are multiple elements with the same text
    await waitFor(() => {
      const errorElements = screen.getAllByText(/Email already exists/i);
      expect(errorElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  test('displays error message on failed registration - server error', async () => {
    const { authAPI } = require('../api/api');
    
    authAPI.signUp.mockRejectedValue(new Error('Server error. Please try again later.'));

    render(
      <SignUpModal 
        onClose={mockOnClose} 
        openSignIn={mockOpenSignIn}
      />
    );

    await userEvent.type(screen.getByLabelText(/First Name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/Last Name/i), 'Smith');
    await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/^Password(?!\s*Confirm)/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');
    
    const roleSelect = screen.getByLabelText(/Role/i);
    await userEvent.selectOptions(roleSelect, 'Student');
    
    await userEvent.type(screen.getByLabelText(/Course/i), 'BSIT');
    await userEvent.type(screen.getByLabelText(/Organization/i), 'CCS');
    
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    // Use getAllByText since there are multiple elements with the same text
    await waitFor(() => {
      const errorElements = screen.getAllByText(/Server error/i);
      expect(errorElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});