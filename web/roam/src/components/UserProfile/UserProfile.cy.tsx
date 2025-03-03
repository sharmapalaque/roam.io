import React from 'react'
import UserProfile from './UserProfile'

describe('<UserProfile />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<UserProfile />)
  })
})