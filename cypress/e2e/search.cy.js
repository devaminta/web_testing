describe('Users Management', () => {
    beforeEach(() => {
      cy.viewport(1280, 720) 

      // Login and navigate to users page
      cy.visit('/signin');
    
      // Intercept the NextAuth.js credentials callback and session
      cy.intercept({
        method: 'POST',
        url: '/api/auth/callback/credentials*'
      }).as('loginRequest');
  
      cy.intercept({
        method: 'GET',
        url: '/api/auth/session'
      }).as('sessionCheck');
  
      // Fill in login form
      cy.get('input[id="email"]').type('bemat1616@gmail.com');
      cy.get('input[id="password"]').type("Pass@123");
      
      // Click the login button
      cy.get('button').contains('Login').click();
  
      // Wait for the login request to complete
      cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
  
      // Wait for session to be established
      cy.wait('@sessionCheck').its('response.statusCode').should('eq', 200);
  
      // Wait for any redirects to complete
      cy.wait(2000);
  
      // Directly visit the content management page
      cy.visit('/users', { timeout: 10000 });
  
      // Wait for the table to be visible
      cy.get('table', { timeout: 10000 }).should('be.visible');
    });
    
    it('should search users by name', () => {
      // Intercept the search request
      cy.intercept('GET', '**/search-users*').as('searchRequest');

      // Type in the search box
      cy.get('input[placeholder="Search users..."]').type('Daniel');
  
      // Wait for the search request to complete
      cy.wait('@searchRequest');
      
      // Wait for the table to update and verify search results
      cy.get('tbody tr').should('exist');
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).find('td').first().should('contain', 'Daniel');
      });
      cy.screenshot('search-name');

    });
  
  
  
    it('should filter users by status', () => {
      // Click to open the status filter dropdown
      cy.get('[role="combobox"]').first().click();
      
      // Wait for the options to appear and select "Active"
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').contains('Active').click();
      
      // Verify only active users are shown (non-suspended)
      cy.get('tbody tr').should('have.length', 5); // Daniel and Jane
      cy.screenshot('filter-results');

    
    });
  
 
  }); 