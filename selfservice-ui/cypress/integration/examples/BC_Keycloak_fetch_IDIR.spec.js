// Visit a web page
import "cypress-keycloak-commands";
describe('BC Keycloak Login with IDIR', function()
{
    it('Visit the BC Dev Page and Login', function(){
        cy.log("Visiting the BC Services Card [DEV] URL")
        cy.visit('https://selfservice-dev.pathfinder.gov.bc.ca/')
        cy.wait(10000)
        cy.log("Searching for the Login Button")
        cy.contains('Login').click()
        cy.log("It should open up Login page")
        cy.wait(5000)
        cy.url().should('include','openid-connect')
        cy.log("Should contain a button called IDIR")
        cy.wait(5000)
        cy.contains('IDIR').click()
        cy.wait(5000)
        cy.log("Clicking on the IDIR button should take user to logontest page")
        cy.wait(5000)
        cy.url().should('include','logontest7.gov.bc.ca')
        cy.log("Fetch the exact url")
        cy.url()
        cy.wait(5000)
        cy.log("Logging in with IDIR")
        //Enter your username and password
        // cy.kcLogout();
        // cy.log("Fetching details from Json file and validating with Keycloak")
        // cy.wait(5000)
        // cy.log("Log In with IDIR")
        // cy.kcLogin("IDIR");
        // cy.wait(5000)
        // cy.log("Click on Continue")
        // cy.contains('Continue').click()
        // cy.wait(5000)
        // cy.log("If User is valid, user will be taken to Dashboard view")
        // cy.url().should('include','https://selfservice-dev.pathfinder.gov.bc.ca/dashboard')
        // cy.wait(10000)
        // cy.log("Test Complete")
        
    })
})



