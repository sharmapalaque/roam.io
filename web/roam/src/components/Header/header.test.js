import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from './Header';

// Mock the setTimeout to execute immediately
jest.useFakeTimers();

describe('Header Component', () => {
  test('renders logo and navigation links', () => {
    render(<Header />);
    
    // Check for logo
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    
    // Check for slogan
    expect(screen.getByText('Dream. Explore. Discover.')).toBeInTheDocument();
    
    // Check navigation links
    expect(screen.getByText('Accommodation')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<Header />);
    
    // Should display user icon during loading
    expect(screen.getByText('Hi, User')).toBeInTheDocument();
  });

  test('loads user data after timeout', async () => {
    render(<Header />);
    
    // Fast-forward until all timers have been executed
    jest.runAllTimers();
    
    // Check that user data is loaded
    await waitFor(() => {
      expect(screen.getByText('Hi, Palaque')).toBeInTheDocument();
    });
  });

  test('shows dropdown menu on hover', async () => {
    render(<Header />);
    
    // Get user menu button
    const userMenu = screen.getByText('Hi, User').closest('.user-menu');
    
    // Simulate mouse enter
    fireEvent.mouseEnter(userMenu);
    
    // Check dropdown is visible
    const dropdownMenu = screen.getByText('Your Profile').closest('.dropdown-menu');
    expect(dropdownMenu).toHaveClass('show');
    
    // Simulate mouse leave
    fireEvent.mouseLeave(userMenu);
    
    // Check dropdown is hidden
    expect(dropdownMenu).not.toHaveClass('show');
  });

  test('dropdown menu contains profile and logout links', () => {
    render(<Header />);
    
    // Simulate mouse enter to show dropdown
    const userMenu = screen.getByText('Hi, User').closest('.user-menu');
    fireEvent.mouseEnter(userMenu);
    
    // Check dropdown items
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText('Your Profile')).toHaveAttribute('href', '/profile');
    
    expect(screen.getByText('Log Out')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toHaveAttribute('href', '/login');
  });
});
