import React from 'react'
import AccommodationDetails from './AccommodationDetails'

describe('<AccommodationDetails />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<AccommodationDetails />)
  })
})