import { render, screen } from '@testing-library/react';
import App from '../app/App';

test('renders app container', () => {
  render(<App />);
  expect(document.body).toBeInTheDocument();
});