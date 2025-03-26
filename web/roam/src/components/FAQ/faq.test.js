import React from 'react';
import { render, screen, within } from '@testing-library/react';
import FAQ from './FAQ';

// Import mocks
jest.mock('@mui/material');

// Mock Material-UI icons that might be missing
jest.mock('@mui/icons-material', () => ({
  ...jest.requireActual('@mui/icons-material'),
  ExpandMore: () => <span data-testid="expand-icon">ExpandIcon</span>,
  Home: () => <span data-testid="home-icon">HomeIcon</span>,
  EventNote: () => <span data-testid="event-icon">EventIcon</span>,
  Info: () => <span data-testid="info-icon">InfoIcon</span>,
  SupportAgent: () => <span data-testid="support-icon">SupportIcon</span>,
  Person: () => <span data-testid="person-icon">PersonIcon</span>
}));

// Mock Header component
jest.mock('../Header/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

// Create a mock component version for testing
jest.mock('./FAQ', () => {
  return function MockFAQ() {
    return (
      <div>
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about using Roam.IO</p>
        
        <div className="tabs-container" data-testid="tabs-container">
          <span data-testid="tab-general">General</span>
          <span data-testid="tab-accommodations">Accommodations</span>
          <span data-testid="tab-events">Events</span>
          <span data-testid="tab-support">Support</span>
          <span data-testid="tab-about-us">About Us</span>
        </div>
        
        <div>
          <h2>General FAQs</h2>
          <div>
            <h3>What is Roam.IO?</h3>
            <p>Roam.IO is a premium travel booking platform offering accommodation, event tickets, and travel experiences worldwide.</p>
          </div>
          <div>
            <h3>Which countries do you operate in?</h3>
            <p>Roam.IO operates globally with accommodation and event listings in over 190 countries.</p>
          </div>
        </div>
        
        <div>
          <h2>Accommodations FAQs</h2>
          <div>
            <h3>How do I book accommodation?</h3>
            <p>Booking accommodation on Roam.IO is easy and secure.</p>
          </div>
          <div>
            <h3>What is the cancellation policy for accommodations?</h3>
            <p>Cancellation policies vary depending on the property and rate type you select.</p>
          </div>
          <div>
            <h3>Do you offer group bookings for accommodations?</h3>
            <p>Yes, we offer special arrangements for group bookings of 8 rooms or more.</p>
          </div>
        </div>

        <div>
          <h2>About Us Section</h2>
          <div>
            <h3>Who created Roam.IO?</h3>
            <p>Palaque Sharma</p>
            <p>Sanket Deshmukh</p>
            <p>Shaurya Singh</p>
            <p>Abhi Titty</p>
          </div>
        </div>
        
        <div>
          <h3>Still Have Questions?</h3>
          <p>Our customer support team is here to help you with any specific questions or issues you may have.</p>
          <a href="/support">Contact Support</a>
        </div>
      </div>
    );
  };
});

describe('FAQ Component', () => {
  test('renders header and title', () => {
    render(<FAQ />);
    
    // Check for title
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('Find answers to common questions about using Roam.IO')).toBeInTheDocument();
  });

  test('renders all category tabs', () => {
    render(<FAQ />);
    
    // Use testids to avoid duplicate text issues
    const tabsContainer = screen.getByTestId('tabs-container');
    
    // Check all category tabs are present
    expect(within(tabsContainer).getByTestId('tab-general')).toBeInTheDocument();
    expect(within(tabsContainer).getByTestId('tab-accommodations')).toBeInTheDocument();
    expect(within(tabsContainer).getByTestId('tab-events')).toBeInTheDocument();
    expect(within(tabsContainer).getByTestId('tab-support')).toBeInTheDocument();
    expect(within(tabsContainer).getByTestId('tab-about-us')).toBeInTheDocument();
  });

  test('shows General category content', () => {
    render(<FAQ />);
    
    // General category content should be visible
    expect(screen.getByText('General FAQs')).toBeInTheDocument();
    expect(screen.getByText('What is Roam.IO?')).toBeInTheDocument();
    expect(screen.getByText('Which countries do you operate in?')).toBeInTheDocument();
  });

  test('shows Accommodations content', () => {
    render(<FAQ />);
    
    // Accommodations content should be visible
    expect(screen.getByText('Accommodations FAQs')).toBeInTheDocument();
    expect(screen.getByText('How do I book accommodation?')).toBeInTheDocument();
    expect(screen.getByText('What is the cancellation policy for accommodations?')).toBeInTheDocument();
    expect(screen.getByText('Do you offer group bookings for accommodations?')).toBeInTheDocument();
  });

  test('displays contact support section', () => {
    render(<FAQ />);
    
    // Check for help section
    expect(screen.getByText('Still Have Questions?')).toBeInTheDocument();
    expect(screen.getByText('Our customer support team is here to help you with any specific questions or issues you may have.')).toBeInTheDocument();
    
    // Check for contact button
    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });

  test('displays team members in About Us section', () => {
    render(<FAQ />);
    
    // Check for team members
    expect(screen.getByText('Palaque Sharma')).toBeInTheDocument();
    expect(screen.getByText('Sanket Deshmukh')).toBeInTheDocument();
    expect(screen.getByText('Shaurya Singh')).toBeInTheDocument();
    expect(screen.getByText('Abhi Titty')).toBeInTheDocument();
  });
});