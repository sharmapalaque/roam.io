import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

// Mock the dependencies
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (cb) => jest.fn((e) => {
      e.preventDefault();
      cb({ email: 'test@example.com', password: 'password123' });
    }),
    formState: { errors: {} }
  })
}));

jest.mock('@hookform/resolvers/yup', () => ({
  yupResolver: jest.fn()
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
);

describe('Login Component', () => {
  beforeEach(() => {
    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        href: ''
      },
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form elements', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Check for form elements
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
    expect(screen.getByText('Register Here')).toBeInTheDocument();
    expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
    
    // Changed to use testid for password input instead of label
    expect(screen.getByRole('button', { name: /SIGN IN/i })).toBeInTheDocument();
    
    // Check for password toggle button
    expect(screen.getByRole('button', { name: /Show password/i })).toBeInTheDocument();
    
    // Check the password field exists
    expect(document.querySelector('#password')).toBeInTheDocument();
  });

  test('toggles password visibility when the toggle button is clicked', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Get password input by ID and toggle button by role
    const passwordInput = document.querySelector('#password');
    const toggleButton = screen.getByRole('button', { name: /Show password/i });
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click the toggle button to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');
    
    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
  });

  test('submits form with user data and redirects on success', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Trigger form submission
    const submitButton = screen.getByRole('button', { name: /SIGN IN/i });
    fireEvent.click(submitButton);
    
    // Verify fetch was called with correct arguments
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        credentials: 'include',
      });
    });
    
    // Verify redirect on success
    await waitFor(() => {
      expect(window.location.href).toBe('/accommodation');
    });
  });

  test('displays alert on API error', async () => {
    // Override the fetch mock to simulate an error
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })
    );
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Trigger form submission
    const submitButton = screen.getByRole('button', { name: /SIGN IN/i });
    fireEvent.click(submitButton);
    
    // Verify alert with error message
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error: Invalid credentials');
    });
  });

  test('handles network error gracefully', async () => {
    // Override the fetch mock to simulate a network error
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Trigger form submission
    const submitButton = screen.getByRole('button', { name: /SIGN IN/i });
    fireEvent.click(submitButton);
    
    // Verify alert for network error
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('There was an error with the request');
      expect(console.log).toHaveBeenCalled();
    });
  });

  test('register link navigates correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const registerLink = screen.getByText('Register Here');
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});