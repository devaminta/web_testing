describe('Content Management CRUD Operations', () => {
  beforeEach(() => {
    cy.viewport(1280, 720) 

    // Login steps
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
    cy.visit('/content-management', { timeout: 10000 });

    // Wait for the table to be visible
    cy.get('table', { timeout: 10000 }).should('be.visible');
  });

  it('should display content list and test update/delete operations', () => {
    // Check if table has data
    cy.get('table tbody tr').should('have.length.at.least', 1);

    // Get the content ID from the first row
    cy.get('table tbody tr').first().invoke('attr', 'data-content-id').then((contentId) => {
      // Test Update Operation
      cy.get('table tbody tr').first().within(() => {
        // Click the three dots menu button (last button in the row)
        cy.get('button').last().click();
      });

      // Click the Update option from dropdown
      cy.get('[role="menu"]').contains('Update').click();

      // Wait for the update page to load with the specific content ID
      cy.url().should('include', `/content-management/update/682cf1bac2f27b16792161ae`);

      // Fill in the update form
      cy.get('textarea[id="description"]').clear().type('Updated content description');

      // Submit the form
      cy.get('button[type="Update Content"]').click();

      // Wait for redirect back to content management
      cy.url().should('include', '/content-management');

      // Verify the content was updated
      cy.get('table tbody tr').first().contains('Updated content description');

      cy.screenshot('fectch');

    });

    // Test Delete Operation
    cy.get('table tbody tr').then(($rows) => {
      const initialCount = $rows.length;

      // Click the three dots menu button on the first row
      cy.get('table tbody tr').first().within(() => {
        cy.get('button').last().click();
      });

      // Click the Delete option from dropdown
      cy.get('[role="menu"]').contains('Delete').click();

      // Verify the delete confirmation dialog appears
      cy.get('[role="dialog"]').should('be.visible');

      // Confirm deletion
      cy.get('[role="dialog"] button').contains('Delete').click();

      // Verify the row was deleted
      cy.get('table tbody tr').should('have.length', initialCount - 1);

      cy.screenshot('delete');

    });
  });


  
  it('should delete content from dropdown menu', () => {
    // Get the first content item's description for verification
    cy.get('p.font-medium').first().invoke('text').as('contentDescription');

    // Open the dropdown menu
    cy.get('table tbody tr').first().within(() => {
        cy.get('button').last().click();
      });
    // Click the delete option
    cy.get('[role="menu"]').contains('Delete').click();


    // Verify the content is no longer visible
   
  });

  it('should view content details', () => {
    // Click the three dots menu button
    cy.get('table tbody tr').first().within(() => {
      cy.get('button').last().click();
    });




    // Click View Details from dropdown
    cy.get('[role="menu"]').contains('View Details').click();
    cy.screenshot('getDetail');

  });
}); 