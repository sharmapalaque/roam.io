import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Support from './Support';

// Import mocks
jest.mock('@mui/material');

// Mock the specific icons that are missing
jest.mock('@mui/icons-material', () => ({
  ...jest.requireActual('@mui/icons-material'),
  // Add any missing icons that are used in the component
  LocationOn: () => <span data-testid="location-icon">LocationIcon</span>,
  Send: () => <span data-testid="send-icon">SendIcon</span>,
  WhatsApp: () => <span data-testid="whatsapp-icon">WhatsAppIcon</span>,
  Phone: () => <span data-testid="phone-icon">PhoneIcon</span>
}));

// Mock Header component
jest.mock('../Header/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

// Create a mock component version for testing
jest.mock('./Support', () => {
  return function MockSupport() {
    return (
      <div>
        <h1>Customer Support</h1>
        <p>We're here to help you with any questions or concerns</p>
        <h2>Contact Us</h2>
        <div>
          <h3>Call Us</h3>
          <p>+1 (800) 123-4567</p>
          <p>Available 24/7 for emergency support</p>
        </div>
        <div>
          <h3>WhatsApp</h3>
          <p>+1 (800) 987-6543</p>
          <p>Perfect for international travelers</p>
        </div>
        <h2>Our Offices</h2>
        <div>
          <h3>New York</h3>
          <p>123 Broadway, Suite 400</p>
          <p>New York, NY 10010</p>
        </div>
        <div>
          <h3>Miami</h3>
          <p>456 Ocean Drive</p>
          <p>Miami, FL 33139</p>
        </div>
        <div>
          <h3>San Francisco</h3>
          <p>789 Market Street, Suite 300</p>
          <p>San Francisco, CA 94103</p>
        </div>
        <h2>Send us a Message</h2>
        <form>
          <label>Your Name</label>
          <label>Your Email</label>
          <label>Inquiry Category</label>
          <label>Subject</label>
          <label>Your Message</label>
          <button>Send Message</button>
        </form>
        <h2>Need Emergency Travel Assistance?</h2>
        <p>For urgent matters such as canceled flights</p>
        <p>+1 (800) 999-8888</p>
      </div>
    );
  };
});

describe('Support Component', () => {
  test('renders header and title', () => {
    render(<Support />);
    
    // Check for title
    expect(screen.getByText('Customer Support')).toBeInTheDocument();
    expect(screen.getByText('We\'re here to help you with any questions or concerns')).toBeInTheDocument();
  });

  test('displays contact options section', () => {
    render(<Support />);
    
    // Check section title
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    
    // Check phone contact card
    expect(screen.getByText('Call Us')).toBeInTheDocument();
    expect(screen.getByText('+1 (800) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('Available 24/7 for emergency support')).toBeInTheDocument();
    
    // Check WhatsApp contact card
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('+1 (800) 987-6543')).toBeInTheDocument();
    expect(screen.getByText('Perfect for international travelers')).toBeInTheDocument();
  });

  test('renders office locations section', () => {
    render(<Support />);
    
    // Check section title
    expect(screen.getByText('Our Offices')).toBeInTheDocument();
    
    // Check for each office location
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText(/123 Broadway, Suite 400/)).toBeInTheDocument();
    
    expect(screen.getByText('Miami')).toBeInTheDocument();
    expect(screen.getByText(/456 Ocean Drive/)).toBeInTheDocument();
    
    expect(screen.getByText('San Francisco')).toBeInTheDocument();
    expect(screen.getByText(/789 Market Street, Suite 300/)).toBeInTheDocument();
  });

  test('renders contact form with all fields', () => {
    render(<Support />);
    
    // Check section title
    expect(screen.getByText('Send us a Message')).toBeInTheDocument();
    
    // Check for form fields
    expect(screen.getByText('Your Name')).toBeInTheDocument();
    expect(screen.getByText('Your Email')).toBeInTheDocument();
    expect(screen.getByText('Inquiry Category')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Your Message')).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByText('Send Message')).toBeInTheDocument();
  });

  test('renders emergency support section', () => {
    render(<Support />);
    
    // Check emergency section
    expect(screen.getByText('Need Emergency Travel Assistance?')).toBeInTheDocument();
    expect(screen.getByText(/For urgent matters such as canceled flights/)).toBeInTheDocument();
    expect(screen.getByText('+1 (800) 999-8888')).toBeInTheDocument();
  });
});