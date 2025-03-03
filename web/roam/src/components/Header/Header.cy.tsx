// cypress/component/Header.cy.js
import React from 'react';
import Header from './Header';
import { mount } from "cypress/react";


describe('Header.tsx Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956);
    // Mock the fetch user data calls
    cy.intercept('GET', '**/api/user', {
      delay: 100,
      body: {
        name: 'Palaque Sharma',
        avatarId: 'Marshmallow'
      }
    }).as('getUserData');
    
    // Mount the Header component directly
    mount(<Header />);
  });

  it('should show loading state initially', () => {
    // Override the default intercept with a longer delay
    cy.intercept('GET', '**/api/user', {
      delay: 500,
      body: {
        name: 'Palaque Sharma',
        avatarId: 'Marshmallow'
      }
    }).as('getUserDataDelayed');
    
    // Re-mount the component
    mount(<Header />);
    
    // Verify loading state
    cy.get('.user-icon').should('be.visible');
    cy.get('.user-greeting').should('contain', 'Hi, User');
  });

  // it('should display user info after data is loaded', () => {
  //   // Wait for mock data to load
  //   cy.wait('@getUserData');
    
  //   // Verify user first name is displayed
  //   cy.get('.user-greeting').should('contain', 'Hi, Palaque');
    
  //   // Verify avatar image is displayed
  //   cy.get('.header-avatar-image').should('exist');
  //   cy.get('.header-avatar-image').should('have.attr', 'src').and('include', 'Marshmallow');
  //   cy.get('.header-avatar-image').should('have.attr', 'alt', 'Marshmallow');
  // });

  it('should display logo correctly', () => {
    cy.get('.header-logo').should('be.visible');
    cy.get('.header-logo').should('have.attr', 'src', 'https://i.imgur.com/KJStl0F.png');
    cy.get('.header-logo').should('have.attr', 'alt', 'Logo');
  });

  it('should display slogan text', () => {
    cy.get('.header-slogan').should('contain', 'Dream. Explore. Discover.');
  });

  it('should display all navigation links with correct hrefs', () => {
    const expectedLinks = [
      { text: 'Accommodation', href: '/accommodation' },
      { text: 'Events', href: '/events' },
      { text: 'Support', href: '/support' },
      { text: 'FAQ', href: '/faq' }
    ];
    
    cy.get('.nav-link').should('have.length', 4);
    
    expectedLinks.forEach(link => {
      cy.get('.nav-link')
        .contains(link.text)
        .should('have.attr', 'href', link.href);
    });
  });

  // it('should toggle dropdown menu on mouse enter/leave', () => {
  //   // Initially dropdown should be hidden
  //   cy.get('.dropdown-menu').should('not.have.class', 'show');
    
  //   // Trigger mouseenter
  //   cy.get('.user-menu').trigger('mouseenter');
    
  //   // Verify dropdown is shown and arrow rotates
  //   cy.get('.dropdown-menu').should('have.class', 'show');
  //   cy.get('.dropdown-arrow').should('have.class', 'rotate');
    
  //   // Verify dropdown items
  //   cy.get('.dropdown-item').first().should('contain', 'Your Profile');
  //   cy.get('.dropdown-item').last().should('contain', 'Log Out');
    
  //   // Trigger mouseleave
  //   cy.get('.user-menu').trigger('mouseleave');
    
  //   // Verify dropdown is hidden again
  //   cy.get('.dropdown-menu').should('not.have.class', 'show');
  //   cy.get('.dropdown-arrow').should('not.have.class', 'rotate');
  // });

  // it('should display avatar placeholder when avatar not found', () => {
  //   // Mock user data with non-existent avatar ID
  //   cy.intercept('GET', '**/api/user', {
  //     body: {
  //       name: 'Palaque Sharma',
  //       avatarId: 'NonExistent'
  //     }
  //   }).as('getUserNoAvatar');
    
  //   // Re-mount the component
  //   mount(<Header />);
  //   cy.wait('@getUserNoAvatar');
    
  //   // Verify placeholder shows first letter of name
  //   cy.get('.header-avatar-placeholder').should('exist');
  //   cy.get('.header-avatar-placeholder').should('contain', 'P');
  // });

  // it('should handle empty user data gracefully', () => {
  //   // Mock empty user data response
  //   cy.intercept('GET', '**/api/user', {
  //     body: {}
  //   }).as('getEmptyUserData');
    
  //   // Re-mount the component
  //   mount(<Header />);
  //   cy.wait('@getEmptyUserData');
    
  //   // Verify fallback values
  //   cy.get('.user-greeting').should('contain', 'Hi, User');
    
  //   // Should show placeholder with 'U'
  //   cy.get('.header-avatar-placeholder').should('exist');
  //   cy.get('.header-avatar-placeholder').should('contain', 'U');
  // });
});