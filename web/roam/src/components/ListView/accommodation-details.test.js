import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AccommodationDetails from './AccommodationDetails.tsx';

// Mock Header
jest.mock('../Header/Header', () => function MockHeader() { 
  return <div data-testid="mock-header">Header Component</div>; 
});

// Mock navigate
const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ path, element }) => <div>{element}</div>,
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }) // Mock ID parameter
}));

// Mock Material UI components
jest.mock('@mui/material', () => ({
  Typography: ({ children, variant, className }) => <div className={className}>{children}</div>,
  Container: ({ children, maxWidth }) => <div>{children}</div>,
  Grid: ({ children, container, item, spacing, xs, md }) => <div>{children}</div>,
  Paper: ({ children, elevation }) => <div className="booking-panel">{children}</div>,
  Box: ({ children, className, sx }) => <div className={className}>{children}</div>,
  Button: ({ children, disabled, onClick, variant, fullWidth, className }) => (
    <button 
      disabled={disabled} 
      onClick={onClick} 
      className={className}
    >
      {children}
    </button>
  ),
  TextField: ({ select, fullWidth, value, onChange, SelectProps, size, children }) => (
    <select value={value} onChange={onChange}>{children}</select>
  ),
  Rating: ({ value, precision, readOnly, size }) => <div>{value} stars</div>,
  Divider: () => <hr />,
  Chip: ({ icon, label }) => <div>{label}</div>
}));

// Mock MUI icons
jest.mock('@mui/icons-material', () => ({
  Wifi: () => <span>WifiIcon</span>,
  LocalParking: () => <span>ParkingIcon</span>,
  AcUnit: () => <span>ACIcon</span>,
  Kitchen: () => <span>KitchenIcon</span>,
  Pool: () => <span>PoolIcon</span>,
  Tv: () => <span>TVIcon</span>,
  Home: () => <span>HomeIcon</span>,
  Star: () => <span>StarIcon</span>,
  Phone: () => <span>PhoneIcon</span>,
  Mail: () => <span>MailIcon</span>
}));

describe('AccommodationDetails Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders accommodation details', () => {
    render(<AccommodationDetails />);
    
    // Check for header
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    
    // Check for accommodation name
    expect(screen.getByText('Ocean View Apartment')).toBeInTheDocument();
    
    // Check for location
    expect(screen.getByText('Miami, FL')).toBeInTheDocument();
    
    // Check for description (part of it)
    expect(screen.getByText(/A beautiful ocean view apartment located in Miami, FL/)).toBeInTheDocument();
    
    // Check for price
    expect(screen.getByText(/\$249/)).toBeInTheDocument();
  });

  test('renders booking panel', () => {
    render(<AccommodationDetails />);
    
    // Check for booking panel elements
    expect(screen.getByText('Book This Property')).toBeInTheDocument();
    expect(screen.getByText('Check-In Date')).toBeInTheDocument();
    expect(screen.getByText('Check-Out Date')).toBeInTheDocument();
    expect(screen.getByText('Guests')).toBeInTheDocument();
    expect(screen.getByText('BOOK NOW')).toBeInTheDocument();
  });

  test('Book Now button is initially present', () => {
    render(<AccommodationDetails />);
    
    // Check that Book Now button exists
    const bookButton = screen.getByText('BOOK NOW');
    expect(bookButton).toBeInTheDocument();
  });

  test('can enter booking dates', () => {
    render(<AccommodationDetails />);
    
    // Get date inputs
    const checkInDateInput = document.querySelector('input[type="date"]');
    const checkOutDateInput = document.querySelectorAll('input[type="date"]')[1];
    
    // Set dates
    fireEvent.change(checkInDateInput, { target: { value: '2025-03-10' } });
    fireEvent.change(checkOutDateInput, { target: { value: '2025-03-15' } });
    
    // Check values were set
    expect(checkInDateInput.value).toBe('2025-03-10');
    expect(checkOutDateInput.value).toBe('2025-03-15');
  });

});