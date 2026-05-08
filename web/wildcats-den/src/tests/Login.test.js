import React from 'react';
import userEvent from '@testing-library/user-event';
import { renderWithUserContext, screen, waitFor, fireEvent, createMockUserContext } from './test-utils';
import SignInModal from '../features/auth/components/SignInModal';

// Mock the API
jest.mock('../api/api', () => ({
  authAPI: {
    signIn: jest.fn()
  }
}));

describe('Login Component', () => {
  const mockOnClose = jest.fn();
  const mockOpenSignUp = jest.fn();
  const mockLogin = jest.fn();
  
  let mockContextValue;

  beforeEach(() => {
    jest.clearAllMocks();
    const { authAPI } = require('../api/api');
    authAPI.signIn.mockReset();
    
    // Create fresh mock context for each test
    mockContextValue = createMockUserContext({
      login: mockLogin,
      user: null
    });
  });

  test('renders login form correctly', () => {
    renderWithUserContext(
      <SignInModal onClose={mockOnClose} openSignUp={mockOpenSignUp} />,
      { contextValue: mockContextValue }
    );

    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });

  test('shows error when submitting with invalid credentials', async () => {
    const { authAPI } = require('../api/api');
    authAPI.signIn.mockRejectedValue(new Error('Invalid credentials'));

    renderWithUserContext(
      <SignInModal onClose={mockOnClose} openSignUp={mockOpenSignUp} />,
      { contextValue: mockContextValue }
    );

    await userEvent.type(screen.getByLabelText(/Email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wrongpass');
    
    const submitButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(submitButton);

    // Use getAllByText since there are multiple elements with the same text
    await waitFor(() => {
      const errorElements = screen.getAllByText(/Invalid credentials/i);
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  test('handles successful login', async () => {
    const { authAPI } = require('../api/api');
    
    authAPI.signIn.mockResolvedValue({
      token: 'fake-token-123',
      user: { 
        userId: 1, 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john@example.com',
        userType: 'Student',
        firstLogin: false
      }
    });

    renderWithUserContext(
      <SignInModal onClose={mockOnClose} openSignUp={mockOpenSignUp} />,
      { contextValue: mockContextValue }
    );

    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Login successful/i)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('displays error message on failed login', async () => {
    const { authAPI } = require('../api/api');
    
    authAPI.signIn.mockRejectedValue(new Error('Network error. Please try again.'));

    renderWithUserContext(
      <SignInModal onClose={mockOnClose} openSignUp={mockOpenSignUp} />,
      { contextValue: mockContextValue }
    );

    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password');
    
    const submitButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(submitButton);

    // Use getAllByText since there are multiple elements with the same text
    await waitFor(() => {
      const errorElements = screen.getAllByText(/Network error/i);
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  test('shows change password modal for first-time login', async () => {
    const { authAPI } = require('../api/api');
    
    authAPI.signIn.mockResolvedValue({
      token: 'fake-token-123',
      user: { 
        userId: 1, 
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john@example.com',
        userType: 'Student',
        firstLogin: true
      }
    });

    renderWithUserContext(
      <SignInModal onClose={mockOnClose} openSignUp={mockOpenSignUp} />,
      { contextValue: mockContextValue }
    );

    await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/You must change your password/i)).toBeInTheDocument();
    });
  });

  test('switches to sign up modal when link clicked', () => {
    renderWithUserContext(
      <SignInModal onClose={mockOnClose} openSignUp={mockOpenSignUp} />,
      { contextValue: mockContextValue }
    );

    const signUpLink = screen.getByText(/Sign up here/i);
    fireEvent.click(signUpLink);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOpenSignUp).toHaveBeenCalled();
  });

  test('closes modal when close button clicked', () => {
    renderWithUserContext(
      <SignInModal onClose={mockOnClose} openSignUp={mockOpenSignUp} />,
      { contextValue: mockContextValue }
    );

    const closeButton = screen.getByRole('button', { name: /✕/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});