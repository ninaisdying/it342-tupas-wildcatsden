import React from 'react';
import { render } from '@testing-library/react';
import { UserContext } from '../features/admin/components/UserContext';

// Create a mock context value
export const createMockUserContext = (overrides = {}) => ({
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  isLoading: false,
  updateUser: jest.fn(),
  updateUserPhoto: jest.fn(),
  isCustodian: false,
  isAdmin: false,
  ...overrides
});

// Custom render with UserContext provider
export const renderWithUserContext = (ui, { contextValue = createMockUserContext() } = {}) => {
  return render(
    <UserContext.Provider value={contextValue}>
      {ui}
    </UserContext.Provider>
  );
};

// Re-export everything
export * from '@testing-library/react';