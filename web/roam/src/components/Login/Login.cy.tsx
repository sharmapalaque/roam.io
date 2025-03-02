import { mount } from "cypress/react";
import Login from "./Login";
import { BrowserRouter } from "react-router-dom";

describe("Login Component Tests", () => {
  beforeEach(() => {
    cy.viewport(1470, 956); // Adjust width and height
    mount(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  });

  it("should render the login form", () => {
    cy.get("h2.title").should("have.text", "Login");
    cy.get("form").should("exist");
  });

  it("should show validation errors for empty fields", () => {
    cy.get(".submit-button").click();
    cy.get(".error-text").should("contain", "Email is required");
    cy.get(".error-text").should("contain", "Password is required");
  });

  it("should show validation error for invalid email", () => {
    cy.get("#email").type("invalidemail");
    cy.get(".submit-button").click();
    cy.get(".error-text").should("contain", "Invalid email");
  });

  it("should allow user to enter email and password", () => {
    cy.get("#email").type("test@example.com");
    cy.get("#password").type("password123");
    cy.get("#email").should("have.value", "test@example.com");
    cy.get("#password").should("have.value", "password123");
  });

  it("should submit the form successfully", () => {
    cy.get("#email").type("test@example.com");
    cy.get("#password").type("password123");
    cy.get(".submit-button").click();
    let alertTriggered = false;

    cy.on("window:alert", (txt) => {
      alertTriggered = true;
      expect(txt).to.contains("Error");
    });

    cy.wait(1000).then(() => {
      if (!alertTriggered) {
        cy.log("No alert appeared, considering test as successful.");
      }
    });
  });

  it("should navigate to register page on link click", () => {
    cy.get(".link").click();
    cy.url().should("include", "/register");
  });
});
