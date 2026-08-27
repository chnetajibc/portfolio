import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Bio from './Bio';

describe('Bio', () => {
  it('renders bio text', () => {
    render(<Bio />);
    expect(screen.getByText(/software engineer/)).toBeInTheDocument();
  });

  it('renders with proper spacing class', () => {
    const { container } = render(<Bio />);
    expect(container.firstChild.className).toContain('mt-5');
  });
});
