import React from "react";
import { mount } from "cypress/react";
import Register from "./Register"; // Adjust path as needed
import { BrowserRouter } from "react-router-dom";

describe("Register Component", () => {
  beforeEach(() => {
    cy.viewport(1470, 956); // Adjust width and height
    mount(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  });

  it("should render the registration form", () => {
    cy.get("h2").should("contain", "Create New Account");
    cy.get("#name").should("exist");
    cy.get("#email").should("exist");
    cy.get("#password").should("exist");
    cy.get("#dob").should("exist");
    cy.get(".submit-button").should("exist");
  });

  it("should show validation errors for empty fields", () => {
    cy.get(".submit-button").click();
    cy.get(".error-text").should("contain", "Name is required");
    cy.get(".error-text").should("contain", "Email is required");
    cy.get(".error-text").should("contain", "Password is required");
    cy.get(".error-text").should("contain", "Date of birth is required");
  });

  it("should show validation error for invalid email", () => {
    cy.get("#email").type("invalidemail").blur();
    cy.get(".submit-button").click();
    cy.get(".error-text").should("contain", "Invalid email");
  });

  it("should submit form successfully and show success alert", () => {
    cy.window().then((win) => {
      cy.stub(win, "fetch").resolves({
        ok: true,
        json: () => Promise.resolve({ message: "Registration Successful!" }),
      });
      cy.stub(win, "alert").as("alertStub");
    });

    cy.get("#name").type("Test User");
    cy.get("#email").type("test@example.com");
    cy.get("#password").type("password123");
    cy.get("#dob").type("2000-01-01");
    cy.get(".submit-button").click();

    cy.get("@alertStub").should(
      "have.been.calledWith",
      "Registration Successful! You will be redirected to login page shortly."
    );
  });
});
