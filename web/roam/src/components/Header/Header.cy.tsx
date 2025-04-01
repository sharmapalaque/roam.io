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

  
});