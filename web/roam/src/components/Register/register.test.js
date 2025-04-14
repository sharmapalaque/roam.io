import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

// Mock the dependencies
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (cb) => jest.fn((e) => {
      e.preventDefault();
      cb({ 
        name: 'Test User', 
        email: 'test@example.com', 
        password: 'password123',
        dob: '2000-01-01'
      });
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

describe('Register Component', () => {
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

  test('renders registration form elements', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Check for form elements
    expect(screen.getByText('Create New Account')).toBeInTheDocument();
    expect(screen.getByText(/Already registered?/i)).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/NAME/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/EMAIL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/DATE OF BIRTH/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SIGN UP/i })).toBeInTheDocument();
    
    // Check for password toggle button
    expect(screen.getByRole('button', { name: /Show password/i })).toBeInTheDocument();
    
    // Check the password field exists using querySelector
    expect(document.querySelector('#password')).toBeInTheDocument();
  });

  test('toggles password visibility when the toggle button is clicked', () => {
    render(
      <MemoryRouter>
        <Register />
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
        <Register />
      </MemoryRouter>
    );
    
    // Trigger form submission
    const submitButton = screen.getByRole('button', { name: /SIGN UP/i });
    fireEvent.click(submitButton);
    
    // Verify fetch was called with correct arguments
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: 'Test User', 
          email: 'test@example.com', 
          password: 'password123',
          dob: '2000-01-01'
        }),
      });
    });
    
    // Verify alert and redirect on success
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Registration Successful! You will be redirected to login page shortly.');
      expect(window.location.href).toBe('/login');
    });
  });

  test('displays alert on API error', async () => {
    // Override the fetch mock to simulate an error
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already exists' }),
      })
    );
    
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Trigger form submission
    const submitButton = screen.getByRole('button', { name: /SIGN UP/i });
    fireEvent.click(submitButton);
    
    // Verify alert with error message
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error: Email already exists');
    });
  });

  test('handles network error gracefully', async () => {
    // Override the fetch mock to simulate a network error
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Trigger form submission
    const submitButton = screen.getByRole('button', { name: /SIGN UP/i });
    fireEvent.click(submitButton);
    
    // Verify alert for network error
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('There was an error with the request');
      expect(console.log).toHaveBeenCalled();
    });
  });

  test('login link navigates correctly', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    const loginLink = screen.getByText('Login');
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});