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

describe('Login Component', () => {
  beforeEach(() => {
    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
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
    expect(screen.getByLabelText(/PASSWORD/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SIGN IN/i })).toBeInTheDocument();
  });

  test('submits form with user data', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    // Trigger form submission
    const submitButton = screen.getByRole('button', { name: /SIGN IN/i });
    fireEvent.click(submitButton);
    
    // Verify console.log and alert were called
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Form Data:', expect.any(Object));
      expect(window.alert).toHaveBeenCalledWith('Login successful!');
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
