describe('FormStateSubscribe', () => {
  it('should subscribe to specific field state and render errors', () => {
    cy.visit('http://localhost:3000/formStateSubscribe');

    // Initially, no errors should be shown
    cy.get('#firstNameState').should('be.empty');
    cy.get('#lastNameState').should('be.empty');
    cy.get('#emailState').should('be.empty');
    cy.get('#ageState').should('be.empty');

    // Type and clear firstName to trigger required error
    cy.get('input[placeholder="First Name"]').type('John');
    cy.get('input[placeholder="First Name"]').clear();
    cy.get('input[placeholder="First Name"]').blur();
    cy.get('#firstNameState').should('contain', 'First name is required');
    cy.get('#firstNameState').should('contain', '(touched)');

    // Fix firstName
    cy.get('input[placeholder="First Name"]').type('John');
    cy.get('#firstNameState').should('not.contain', 'First name is required');
    cy.get('#firstNameState').should('contain', '(dirty)');

    // Test lastName with minLength validation
    cy.get('input[placeholder="Last Name"]').type('D');
    cy.get('input[placeholder="Last Name"]').blur();
    cy.get('#lastNameState').should('contain', 'Min length is 2');

    cy.get('input[placeholder="Last Name"]').type('oe');
    cy.get('#lastNameState').should('not.contain', 'Min length is 2');

    // Test email pattern validation
    cy.get('input[placeholder="Email"]').type('invalid');
    cy.get('input[placeholder="Email"]').blur();
    cy.get('#emailState').should('contain', 'Invalid email address');

    cy.get('input[placeholder="Email"]').clear();
    cy.get('input[placeholder="Email"]').type('john@example.com');
    cy.get('#emailState').should('not.contain', 'Invalid email address');

    // Test age min/max validation
    cy.get('input[placeholder="Age"]').type('15');
    cy.get('input[placeholder="Age"]').blur();
    cy.get('#ageState').should('contain', 'Must be 18 or older');

    cy.get('input[placeholder="Age"]').clear();
    cy.get('input[placeholder="Age"]').type('101');
    cy.get('#ageState').should('contain', 'Must be 100 or younger');

    cy.get('input[placeholder="Age"]').clear();
    cy.get('input[placeholder="Age"]').type('25');
    cy.get('#ageState').should('not.contain', 'Must be');

    // Check overall form state
    cy.get('#formState').should('contain', 'Is Dirty: Yes');
    cy.get('#formState').should('contain', 'Is Valid: Yes');
    cy.get('#formState').should('contain', 'Error Count: 0');
  });

  it('should not cause unnecessary re-renders of the main form', () => {
    cy.visit('http://localhost:3000/formStateSubscribe');

    // The main form should render once initially
    cy.get('#renderCount').should('contain', '1');

    // Type in various fields
    cy.get('input[placeholder="First Name"]').type('John');
    cy.get('input[placeholder="Last Name"]').type('Doe');
    cy.get('input[placeholder="Email"]').type('john@example.com');
    cy.get('input[placeholder="Age"]').type('25');

    // The main form render count should remain low (ideally 1, but allowing for framework updates)
    cy.get('#renderCount').should(($count) => {
      const count = parseInt($count.text().match(/\d+/)?.[0] || '0', 10);
      expect(count).to.be.lessThan(5);
    });
  });
});
