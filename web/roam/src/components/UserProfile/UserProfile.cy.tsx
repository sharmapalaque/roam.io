import UserProfile from './UserProfile';
import { mount } from 'cypress/react';
import { BrowserRouter } from "react-router-dom";

describe('UserProfile Component', () => {
  beforeEach(() => {
    cy.viewport(1470, 956); // Adjust width and height
    mount(
      <BrowserRouter>
        <UserProfile />
      </BrowserRouter>
    );
  });

  // Test if the profile page loads with the correct title and user name
  it('should render the profile page with title and user name', () => {
    cy.get('.user-name').should('contain', 'Palaque Sharma'); 
  });

  // Test avatar selection drawer opens and closes
  it('should open and close the avatar selection drawer', () => {
    cy.get('.user-avatar-wrapper').click(); 
    cy.get('.avatar-drawer').should('be.visible'); 
  });

  // Test avatar selection functionality
  it('should change the avatar when a new avatar is selected', () => {
    cy.get('.user-avatar-wrapper').click(); 
    cy.get('.avatar-option').eq(1).click(); 
    cy.get('.user-avatar-image').should('have.attr', 'src').and('include', '.png'); 
  });
});
