import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

describe('NotFound Component', () => {
  test('renders 404 page elements', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    
    // Check for main elements
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText("Oops! Page Not Found")).toBeInTheDocument();
    expect(screen.getByText(/The page you're looking for doesn't exist or has been moved/i)).toBeInTheDocument();
    expect(screen.getByText(/You might have mistyped the address or the page may have moved/i)).toBeInTheDocument();
  });

  test('renders action buttons', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /GO HOME/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /FIND STAYS/i })).toBeInTheDocument();
  });

  test('home button navigates correctly', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    
    const homeButton = screen.getByRole('button', { name: /GO HOME/i });
    // Check that the button is within a link that points to the home page
    expect(homeButton.closest('a')).toHaveAttribute('href', '/');
  });

  test('find stays button navigates correctly', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    
    const staysButton = screen.getByRole('button', { name: /FIND STAYS/i });
    // Check that the button is within a link that points to the accommodation page
    expect(staysButton.closest('a')).toHaveAttribute('href', '/accommodation');
  });

  test('support link navigates correctly', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    
    const contactLink = screen.getByText('Contact Support');
    expect(contactLink).toHaveAttribute('href', '/Support');
  });
});