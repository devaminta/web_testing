describe('UI Element Interactions', () => {
  beforeEach(() => {
    cy.viewport(1280, 720) 

    cy.visit('/signin')
  })

  describe('Form Input Interactions', () => {
    it('should handle email input validation', () => {
      // Test empty email
      cy.get('input[id="email"]').clear()
      cy.get('button').contains('Login').click()
      // Check for error message in console
      cy.on('window:console', (log) => {
        expect(log.text).to.include('Email and password are required')
      })

      // Test invalid email format
      cy.get('input[id="email"]').type('invalid-email')
      cy.get('button').contains('Login').click()
      cy.get('input[id="email"]').should('have.attr', 'type', 'email')

      cy.screenshot('input-interaction');

    })

    it('should handle password input validation', () => {
      // Test empty password
      cy.get('input[id="password"]').clear()
      cy.get('button').contains('Login').click()
      // Check for error message in console
      cy.on('window:console', (log) => {
        expect(log.text).to.include('Email and password are required')
      })


      cy.screenshot('validation');

      // Test password field type
      cy.get('input[id="password"]').should('have.attr', 'type', 'password')
    })
  })

  describe('Button Interactions', () => {
    it('should handle login button states', () => {
      // Test button is enabled when form is valid
      cy.get('input[id="email"]').type('test@example.com')
      cy.get('input[id="password"]').type('password123')
      cy.get('button').contains('Login').should('be.visible')

      // Test button styling
      cy.get('button').contains('Login').should('have.class', 'bg-[#4640DE]')
      cy.get('button').contains('Login').should('have.class', 'text-white')

      cy.screenshot('button');

    })
  })

  describe('Navigation Links', () => {
    it('should handle signup link navigation', () => {
      cy.contains('Sign Up').should('be.visible')
      cy.contains('Sign Up').should('have.attr', 'href', '/signup')
    })

    it('should handle form layout', () => {
      // Check form container
      cy.get('form').should('be.visible')
      cy.get('form').should('have.class', 'flex')
      cy.get('form').should('have.class', 'flex-col')

      // Check input field styling
      cy.get('input[id="email"]').should('have.class', 'rounded-lg')
      cy.get('input[id="password"]').should('have.class', 'rounded-lg')

      // Check button styling
      cy.get('button').contains('Login').should('have.class', 'rounded-full')
      cy.get('button').contains('Login').should('have.class', 'bg-[#4640DE]')
      cy.screenshot('form');

    })
  })

  describe('Form Layout and Styling', () => {
    it('should maintain proper form layout', () => {
      // Check form container
      cy.get('form').should('be.visible')
      cy.get('form').should('have.class', 'flex')
      cy.get('form').should('have.class', 'flex-col')

      // Check input field styling
      cy.get('input[id="email"]').should('have.class', 'rounded-lg')
      cy.get('input[id="password"]').should('have.class', 'rounded-lg')

      // Check button styling
      cy.get('button').contains('Login').should('have.class', 'rounded-full')
      cy.get('button').contains('Login').should('have.class', 'bg-[#4640DE]')

      cy.screenshot('form-layout');

    })

    it('should handle responsive design', () => {
      // Test mobile viewport
      cy.viewport('iphone-6')
      cy.get('form').should('be.visible')
      cy.get('input[id="email"]').should('be.visible')
      cy.get('input[id="password"]').should('be.visible')

      // Test desktop viewport
      cy.viewport('macbook-13')
      cy.get('form').should('be.visible')
      cy.get('input[id="email"]').should('be.visible')
      cy.get('input[id="password"]').should('be.visible')

      cy.screenshot('responsive');

    })
  })

  describe('Error Handling UI', () => {
    it('should display error messages appropriately', () => {
      // Test invalid login attempt
      cy.get('input[id="email"]').type('invalid@email.com')
      cy.get('input[id="password"]').type('wrongpassword')
      cy.get('button').contains('Login').click()

      cy.screenshot('error');


      // Check for error message in console
      cy.on('window:console', (log) => {
        expect(log.text).to.include('Error signing in')
      })
    })
  })
}) 