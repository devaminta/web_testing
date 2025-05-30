describe('Login Functionality', () => {
  
  beforeEach(() => {
    cy.viewport(1280, 720) 
    cy.visit('/signin') // Updated to match your actual route
  })

  it('should display login form', () => {
    cy.get('form').should('exist')
    cy.get('input[id="email"]').should('exist')
    cy.get('input[id="password"]').should('exist')
    cy.get('button').contains('Login').should('exist')
  })

  it('should show error with invalid credentials', () => {
    cy.get('input[id="email"]').type('invalid@email.com')
    cy.get('input[id="password"]').type('wrongpassword')
    cy.get('button').contains('Login').click()
    // The error message will be logged to console as per your implementation
    cy.on('window:console', (log) => {
      expect(log.text).to.include('Error signing in')
    })
  })

  it('should successfully login with valid credentials', () => {
    // Intercept the NextAuth.js credentials callback
    cy.intercept({
      method: 'POST',
      url: '/api/auth/callback/credentials*'
    }).as('loginRequest')

    cy.get('input[id="email"]').type('newuser2@email.com')
    cy.get('input[id="password"]').type('securepassword123')
    cy.get('button').contains('Login').click()

    // Wait for the login request to complete
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)

    // After successful login, should redirect to dashboard
    cy.url({ timeout: 30000 }).should('include', '/')
    cy.screenshot('login');

  })
}) 