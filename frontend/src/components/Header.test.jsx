import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

describe('Header', () => {
  it('renders avatar and name', () => {
    render(<Header />);
    expect(screen.getByText(/CH Netaji/)).toBeInTheDocument();
  });

  it('renders available for work status', () => {
    render(<Header />);
    expect(screen.getByText(/available for work/)).toBeInTheDocument();
  });

  it('renders titles', () => {
    render(<Header />);
    expect(screen.getByText(/Entrepreneur/)).toBeInTheDocument();
  });
});
