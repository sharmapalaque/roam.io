// cypress/component/AccommodationList.cy.tsx
import React from 'react';
import AccommodationList from './AccommodationList';
import { BrowserRouter } from 'react-router-dom';
import { mount } from "cypress/react";

// Mock data that will be returned by our API intercept
const mockAccommodations = [
  {
    ID: 1,
    Name: "Ocean View Apartment",
    Location: "Miami, FL",
    ImageUrls: ["https://i.imgur.com/fHyx1wv.png"],
    Description: "A beautiful ocean view apartment located in Miami, FL.",
    Facilities: ["WiFi", "Pool", "Parking"],
    UserReviews: ["Great place!", "Loved the view"]
  },
  {
    ID: 2,
    Name: "Mountain Cabin",
    Location: "Aspen, CO",
    ImageUrls: ["https://i.imgur.com/fHyx1wv.png"],
    Description: "A cozy mountain cabin surrounded by nature in Aspen, Colorado.",
    Facilities: ["Fireplace", "Hiking Trails", "Kitchen"],
    UserReviews: ["Peaceful retreat", "Great hiking nearby"]
  },
  {
    ID: 3,
    Name: "City Center Studio",
    Location: "New York, NY",
    ImageUrls: ["https://i.imgur.com/fHyx1wv.png"],
    Description: "A modern studio apartment located in the heart of New York City.",
    Facilities: ["WiFi", "Gym", "Doorman"],
    UserReviews: ["Perfect location", "Modern and clean"]
  }
];

describe('AccommodationList Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956);
    // Intercept API calls to return mock data
    cy.intercept('GET', 'http://localhost:8080/accommodations*', (req) => {
      // Get the location filter from the query string
      const locationFilter = '';
      
      // Filter the mock data based on location if a filter is provided
      let responseData = mockAccommodations;
      if (locationFilter) {
        responseData = mockAccommodations.filter(acc => 
          acc.Location.includes(locationFilter)
        );
      }
      
      // Return the filtered data
      req.reply({
        statusCode: 200,
        body: responseData
      });
    }).as('getAccommodations');
    
    // Mount the component with Router since it uses navigation
    mount(
      <BrowserRouter>
        <AccommodationList />
      </BrowserRouter>
    );
    
    // Wait for initial data load
    cy.wait('@getAccommodations');
  });

  it('should display the page title correctly', () => {
    cy.get('.page-title').should('contain', 'Find Your Perfect Stay');
  });

  it('should display all accommodations on initial load', () => {
    cy.get('.accommodation-card').should('have.length', 3);
    cy.get('.accommodation-name').first().should('contain', 'Ocean View Apartment');
    cy.get('.accommodation-description').first().should('contain', 'A beautiful ocean view apartment');
  });

  it('should filter accommodations by search term', () => {
    cy.get('.search-input input').type('mountain');
    cy.wait('@getAccommodations');
    cy.get('.accommodation-name').should('contain', 'Mountain Cabin');
  });

  it('should filter accommodations by location', () => {
    cy.get('#location-select').click();
    cy.get('.MuiMenuItem-root').should('exist');
    cy.contains('.MuiMenuItem-root', 'New York, NY').click();
    cy.wait('@getAccommodations');
    
    cy.get('.accommodation-name').should('contain', 'City Center Studio');
  });

  it('should display no results message when no accommodations match criteria', () => {
    cy.get('.search-input input').type('nonexistent');
    
    cy.wait('@getAccommodations');
    
    cy.get('.accommodation-card').should('not.exist');
    cy.get('.no-results').should('be.visible');
    cy.get('.no-results').should('contain', 'No accommodations found matching your criteria');
  });

  it('should display accommodation details correctly', () => {
    cy.get('.accommodation-card').first().within(() => {
      cy.get('.accommodation-name').should('contain', 'Ocean View Apartment');
      cy.get('.accommodation-location').should('contain', 'Miami, FL');
      cy.get('.accommodation-description').should('contain', 'A beautiful ocean view apartment');
      cy.get('.accommodation-image').should('have.attr', 'src').and('include', '.png');
    });
  });

  it('should reset location filter when "All Locations" is selected', () => {
    cy.get('#location-select').click();
    cy.contains('.MuiMenuItem-root', 'Miami, FL').click();
    cy.wait('@getAccommodations');
    
    cy.get('#location-select').click();
    cy.contains('.MuiMenuItem-root', 'All Locations').click();
    cy.wait('@getAccommodations');
    
    cy.get('.accommodation-card').should('have.length', 3);
  });
  
  // Additional test specifically for the location filter issue
  it('should properly handle location filter selection via the DOM', () => {
    
    cy.get('#location-select').click();
    cy.get('.MuiMenu-paper').then($menu => {
      cy.log('Menu content:', $menu.html());
    });
    
    cy.get('.MuiMenu-paper').contains('Miami, FL').click({ force: true });
    cy.get('#location-select').should('contain.text', 'Miami, FL');
    cy.wait('@getAccommodations');
    
    cy.get('.accommodation-name').should('contain', 'Ocean View Apartment');
  });
});