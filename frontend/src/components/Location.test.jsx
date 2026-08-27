import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Location from './Location';

describe('Location', () => {
  it('renders location text', () => {
    render(<Location />);
    expect(screen.getByText(/Chennai, India/)).toBeInTheDocument();
  });

  it('renders with map pin icon', () => {
    const { container } = render(<Location />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
