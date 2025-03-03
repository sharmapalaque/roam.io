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

describe('Register Component', () => {
  beforeEach(() => {
    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
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
    expect(screen.getByLabelText(/PASSWORD/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/DATE OF BIRTH/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SIGN UP/i })).toBeInTheDocument();
  });

  test('submits form with user data', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    // Trigger form submission
    const submitButton = screen.getByRole('button', { name: /SIGN UP/i });
    fireEvent.click(submitButton);
    
    // Verify console.log and alert were called
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Form Data:', expect.any(Object));
      expect(window.alert).toHaveBeenCalledWith('Registration successful!');
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
