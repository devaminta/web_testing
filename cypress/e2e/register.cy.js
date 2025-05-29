describe('Registration Functionality', () => {
  beforeEach(() => {
    cy.visit('/signup') // Updated to match your actual route
  })

  it('should display registration form', () => {
    cy.get('form').should('exist')
    cy.get('input[id="firstName"]').should('exist')
    cy.get('input[id="lastName"]').should('exist')
    cy.get('input[id="email"]').should('exist')
    cy.get('input[id="password"]').should('exist')
    cy.get('input[id="confirmPassword"]').should('exist')
    cy.get('select[name="gender"]').should('exist')
    cy.get('button[type="submit"]').should('exist')
  })

  it('should show error with invalid email format', () => {
    cy.get('input[id="firstName"]').type('John')
    cy.get('input[id="lastName"]').type('Doe')
    cy.get('input[id="email"]').type('invalid-email')
    cy.get('input[id="password"]').type('password123')
    cy.get('input[id="confirmPassword"]').type('password123')
    cy.get('select[name="gender"]').select('male')
    cy.get('button[type="submit"]').click()
    cy.contains('Invalid email address!').should('be.visible')
  })

  it('should show error with short password', () => {
    cy.get('input[id="firstName"]').type('John')
    cy.get('input[id="lastName"]').type('Doe')
    cy.get('input[id="email"]').type('valid@email.com')
    cy.get('input[id="password"]').type('short')
    cy.get('input[id="confirmPassword"]').type('short')
    cy.get('select[name="gender"]').select('male')
    cy.get('button[type="submit"]').click()
    cy.contains('password length minimum of 6 charachter').should('be.visible')
  })

  it('should successfully register with valid data', () => {
    // Intercept the registration API call
    cy.intercept({
      method: 'POST',
      url: 'http://localhost:3000/auth/register'
    }).as('registerRequest')

    cy.get('input[id="firstName"]').type('John')
    cy.get('input[id="lastName"]').type('Doe')
    cy.get('input[id="email"]').type('newuser2@email.com')
    cy.get('input[id="password"]').type('securepassword123')
    cy.get('input[id="confirmPassword"]').type('securepassword123')
    cy.get('select[name="gender"]').select('male')
    
    // Click submit and wait for the API call to complete
    cy.get('button[type="submit"]').click()
    
    // Wait for the registration request to complete
    cy.wait('@registerRequest').its('response.statusCode').should('eq', 201)

    // Wait for navigation and check URL
    cy.url({ timeout: 30000 }).should('include', '/otp-verify')
  })
}) 