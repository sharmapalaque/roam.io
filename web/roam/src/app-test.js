import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the child components
jest.mock('./components/Login/Login', () => () => <div data-testid="mock-login">Login Component</div>);
jest.mock('./components/Register/Register', () => () => <div data-testid="mock-register">Register Component</div>);
jest.mock('./components/ListView/AccommodationList', () => () => <div data-testid="mock-accommodation-list">Accommodation List Component</div>);
jest.mock('./components/ListView/AccommodationDetails', () => () => <div data-testid="mock-accommodation-details">Accommodation Details Component</div>);
jest.mock('./components/UserProfile/UserProfile', () => () => <div data-testid="mock-user-profile">User Profile Component</div>);

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="mock-browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="mock-routes">{children}</div>,
  Route: ({ path, element }) => <div data-testid={`mock-route-${path.replace('/', '').replace(':', '')}`}>{element}</div>,
}));

describe('App Component', () => {
  test('renders router structure', () => {
    render(<App />);
    
    // Verify router components are rendered
    expect(screen.getByTestId('mock-browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('mock-routes')).toBeInTheDocument();
  });

  test('renders routes for all paths', () => {
    render(<App />);
    
    // Check all routes
    expect(screen.getByTestId('mock-route-login')).toBeInTheDocument();
    expect(screen.getByTestId('mock-route-register')).toBeInTheDocument();
    expect(screen.getByTestId('mock-route-accommodation')).toBeInTheDocument();
    expect(screen.getByTestId('mock-route-detailsid')).toBeInTheDocument();
    expect(screen.getByTestId('mock-route-profile')).toBeInTheDocument();
    expect(screen.getByTestId('mock-route-')).toBeInTheDocument(); // Default route
  });

  test('renders login component on default route', () => {
    render(<App />);
    
    const defaultRoute = screen.getByTestId('mock-route-');
    expect(defaultRoute).toContainElement(screen.getByTestId('mock-login'));
  });
});
