import React from 'react'
import AccommodationList from './AccommodationList'

describe('<AccommodationList />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<AccommodationList />)
  })
})