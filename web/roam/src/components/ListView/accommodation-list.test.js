import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AccommodationList from './AccommodationList';

// Mock the dependencies
jest.mock('../Header/Header', () => () => <div data-testid="mock-header">Header Component</div>);

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('AccommodationList Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders page title and search components', () => {
    render(
      <MemoryRouter>
        <AccommodationList />
      </MemoryRouter>
    );
    
    // Check for header
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    
    // Check for title
    expect(screen.getByText('Find Your Perfect Stay')).toBeInTheDocument();
    
    // Check for search input
    expect(screen.getByPlaceholderText('Search accommodations...')).toBeInTheDocument();
    
    // Check for location filter
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
  });

  // test('displays all accommodation cards initially', () => {
  //   render(
  //     <MemoryRouter>
  //       <AccommodationList />
  //     </MemoryRouter>
  //   );
    
  //   // Check for accommodation cards
  //   expect(screen.getByText('Ocean View Apartment')).toBeInTheDocument();
  //   expect(screen.getByText('Mountain Cabin')).toBeInTheDocument();
  //   expect(screen.getByText('City Center Studio')).toBeInTheDocument();
    
  //   // Check location information
  //   expect(screen.getByText('Miami, FL')).toBeInTheDocument();
  //   expect(screen.getByText('Aspen, CO')).toBeInTheDocument();
  //   expect(screen.getByText('New York, NY')).toBeInTheDocument();
  // });

  // test('filters accommodations by search term', () => {
  //   render(
  //     <MemoryRouter>
  //       <AccommodationList />
  //     </MemoryRouter>
  //   );
    
  //   // Get search input and type
  //   const searchInput = screen.getByPlaceholderText('Search accommodations...');
  //   fireEvent.change(searchInput, { target: { value: 'ocean' } });
    
  //   // Check that only matching cards are displayed
  //   expect(screen.getByText('Ocean View Apartment')).toBeInTheDocument();
  //   expect(screen.queryByText('Mountain Cabin')).not.toBeInTheDocument();
  //   expect(screen.queryByText('City Center Studio')).not.toBeInTheDocument();
  // });
  
  // test('navigates to details page when card is clicked', () => {
  //   render(
  //     <MemoryRouter>
  //       <AccommodationList />
  //     </MemoryRouter>
  //   );
    
  //   // Get first accommodation card and click it
  //   const firstCard = screen.getByText('Ocean View Apartment').closest('.accommodation-card');
  //   fireEvent.click(firstCard);
    
  //   // Check navigation was triggered with correct ID
  //   expect(mockNavigate).toHaveBeenCalledWith('/details/1');
  // });
});
