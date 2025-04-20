import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccommodationDetails from './AccommodationDetails.tsx';

// Mock Header
jest.mock('../Header/Header', () => function MockHeader() { 
  return <div data-testid="mock-header">Header Component</div>; 
});

// Mock navigate
const mockNavigate = jest.fn();

// Mock window.open for Navigate Me functionality
const mockWindowOpen = jest.fn();
window.open = mockWindowOpen;

// Mock window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

// Mock fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({
      ID: 1,
      Name: "Ocean View Apartment",
      Location: "Miami, FL",
      Coordinates: "25.7617,-80.1918",
      ImageUrls: [
        "https://i.imgur.com/fHyx1wv.png",
        "https://i.imgur.com/fHyx1wv.png",
        "https://i.imgur.com/fHyx1wv.png",
        "https://i.imgur.com/fHyx1wv.png",
      ],
      Description: "A beautiful ocean view apartment located in Miami, FL. This luxurious apartment offers stunning views of the Atlantic Ocean from its private balcony.",
      PricePerNight: 249,
      Rating: 4.8,
      UserReviews: [
        {
          ID: 101,
          UserName: "Sarah J.",
          Rating: 5,
          Date: "August 15, 2023",
          Comment: "Absolutely spectacular views!"
        }
      ],
      Facilities: ["Wifi", "Parking", "Air Conditioning"],
      Owner: {
        Name: "Jessica Miller",
        Email: "jessica@example.com",
        Phone: "+1 (305) 555-1234",
        ResponseRate: "97% within 24 hours",
      }
    }))
  })
);

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
  Box: ({ children, className, sx }) => <div className={className || "box"}>{children}</div>,
  Button: ({ children, disabled, onClick, variant, fullWidth, className, startIcon }) => (
    <button 
      disabled={disabled} 
      onClick={onClick} 
      className={className}
      data-testid={children === 'NAVIGATE ME' ? 'navigate-button' : undefined}
    >
      {startIcon && <span>{startIcon}</span>}
      {children}
    </button>
  ),
  TextField: ({ select, fullWidth, value, onChange, SelectProps, size, children }) => (
    <select value={value} onChange={onChange}>{children}</select>
  ),
  Rating: ({ value, precision, readOnly, size }) => <div>{value} stars</div>,
  Divider: () => <hr />,
  Chip: ({ icon, label }) => <div>{label}</div>,
  TextareaAutosize: ({ minRows, className, placeholder, value, onChange }) => (
    <textarea 
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  )
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
  Mail: () => <span>MailIcon</span>,
  LocationOn: () => <span>LocationIcon</span>
}));

// Default timeout for waitFor
const DEFAULT_TIMEOUT = 5000;

describe('AccommodationDetails Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockWindowOpen.mockClear();
    mockAlert.mockClear();
    global.fetch.mockClear();
    // Clear any mocked implementations to use defaults
    jest.clearAllMocks();
  });

  test('renders accommodation details', async () => {
    render(<AccommodationDetails />);
    
    // Check for header
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    
    // Wait for component to load data with extended timeout
    await waitFor(() => {
      expect(screen.getByText('Ocean View Apartment')).toBeInTheDocument();
    }, { timeout: DEFAULT_TIMEOUT });
    
    // Check for other elements
    expect(screen.getByText('Miami, FL')).toBeInTheDocument();
    expect(screen.getByText(/4.8 stars/)).toBeInTheDocument();
    expect(screen.getByText(/\$249/)).toBeInTheDocument();
  });

  test('renders booking panel', async () => {
    render(<AccommodationDetails />);
    
    // Wait for component to load data with extended timeout
    await waitFor(() => {
      expect(screen.getByText('Book This Property')).toBeInTheDocument();
    }, { timeout: DEFAULT_TIMEOUT });
    
    expect(screen.getByText('Check-In Date')).toBeInTheDocument();
    expect(screen.getByText('Check-Out Date')).toBeInTheDocument();
    expect(screen.getByText('Guests')).toBeInTheDocument();
    expect(screen.getByText('BOOK NOW')).toBeInTheDocument();
  });

  test('Book Now button is initially present', async () => {
    render(<AccommodationDetails />);
    
    // Wait for component to load data with extended timeout
    await waitFor(() => {
      const bookButton = screen.getByText('BOOK NOW');
      expect(bookButton).toBeInTheDocument();
    }, { timeout: DEFAULT_TIMEOUT });
  });

  test('can enter booking dates', async () => {
    render(<AccommodationDetails />);
    
    // Wait for component to load data with extended timeout
    await waitFor(() => {
      expect(screen.getByText('Ocean View Apartment')).toBeInTheDocument();
    }, { timeout: DEFAULT_TIMEOUT });
    
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

  // New tests for Navigate Me functionality
  test('renders Navigate Me button', async () => {
    render(<AccommodationDetails />);
    
    // Wait for component to load data with extended timeout
    await waitFor(() => {
      expect(screen.getByText('Ocean View Apartment')).toBeInTheDocument();
    }, { timeout: DEFAULT_TIMEOUT });
    
    // Check that Navigate Me button exists
    await waitFor(() => {
      const navigateButton = screen.getByText('NAVIGATE ME');
      expect(navigateButton).toBeInTheDocument();
    }, { timeout: DEFAULT_TIMEOUT });
  });

  test('Navigate Me button opens Google Maps in new tab', async () => {
    render(<AccommodationDetails />);
    
    // Wait for component to load data with extended timeout
    await waitFor(() => {
      expect(screen.getByText('Ocean View Apartment')).toBeInTheDocument();
    }, { timeout: DEFAULT_TIMEOUT });
    
    // Find the Navigate Me button with extended timeout
    let navigateButton;
    await waitFor(() => {
      navigateButton = screen.getByText('NAVIGATE ME');
      expect(navigateButton).toBeInTheDocument();
    }, { timeout: DEFAULT_TIMEOUT });
    
    // Click the button
    fireEvent.click(navigateButton);
    
    // Check that window.open was called with Google Maps URL
    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalled();
    }, { timeout: DEFAULT_TIMEOUT });
    
    // The URL should contain the coordinates
    const callArgs = mockWindowOpen.mock.calls[0];
    expect(callArgs[0]).toContain('https://www.google.com/maps/dir/');
    expect(callArgs[0]).toContain('api=1&destination=');
    expect(callArgs[0]).toContain('25.7617,-80.1918'); // The coordinates from our mock data
    
    // Second arg should be '_blank' to open in a new tab
    expect(callArgs[1]).toBe('_blank');
  });

  test('Navigate Me button handles missing coordinates', async () => {
    // Change the mock fetch response to have no coordinates
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({
          ID: 1,
          Name: "Ocean View Apartment",
          Location: "Miami, FL",
          Coordinates: "", // Empty coordinates
          ImageUrls: ["https://i.imgur.com/fHyx1wv.png"],
          Description: "A beautiful ocean view apartment",
          PricePerNight: 249,
          Rating: 4.8,
          UserReviews: [],
          Facilities: [],
          Owner: {
            Name: "Jessica Miller",
            Email: "jessica@example.com",
            Phone: "+1 (305) 555-1234",
            ResponseRate: "97% within 24 hours",
          }
        }))
      })
    );
    
    render(<AccommodationDetails />);
    
    // Wait for component to load data with extended timeout
    await waitFor(() => {
      expect(screen.getByText('Ocean View Apartment')).toBeInTheDocument();
    }, { timeout: DEFAULT_TIMEOUT });
    
    // Find the Navigate Me button with extended timeout
    let navigateButton;
    await waitFor(() => {
      navigateButton = screen.getByText('NAVIGATE ME');
      expect(navigateButton).toBeInTheDocument();
    }, { timeout: DEFAULT_TIMEOUT });
    
    // Click the button
    fireEvent.click(navigateButton);
    
    // Check that alert was shown instead of opening Google Maps
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Navigation coordinates are not available for this property."
      );
    }, { timeout: DEFAULT_TIMEOUT });
    
    // Verify that window.open was not called
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });
});