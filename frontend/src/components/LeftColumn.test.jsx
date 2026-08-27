import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeftColumn from './LeftColumn';

describe('LeftColumn', () => {
  it('renders without unnecessary bottom gap', () => {
    const { container } = render(<LeftColumn onSectionOpen={() => {}} />);
    const section = container.firstChild;
    
    // Check that the section has items-start to prevent stretching
    expect(section.className).toContain('items-start');
    
    // Check that content is present
    expect(screen.getByText(/Chennai, India/)).toBeInTheDocument();
  });

  it('has correct flex alignment classes', () => {
    const { container } = render(<LeftColumn onSectionOpen={() => {}} />);
    const section = container.firstChild;
    
    // Should have flex flex-col items-start
    expect(section.className).toMatch(/flex flex-col items-start/);
  });
});
