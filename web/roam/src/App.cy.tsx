import React from 'react'
import App from './App'

describe('<App />', () => {
  // Set viewport size before each test
  beforeEach(() => {
    cy.viewport(1366, 768); // Adjust width and height
  });

  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<App />)
  })
})