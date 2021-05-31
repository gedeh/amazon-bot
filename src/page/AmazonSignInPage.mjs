import { By, until } from 'selenium-webdriver'

export default class AmazonSignInPage {
    constructor(driver, config) {
        this.driver = driver
        this.config = config
    }

    async populateEmailThenContinue() {
        const emailInput = By.css('form[name="signIn"] input[type="email"]#ap_email')
        await this.driver.findElement(emailInput).clear()
        await this.driver.findElement(emailInput).sendKeys(this.config.username)

        await this.driver.findElement(By.css('form[name="signIn"] input#continue')).click()
        await this.driver.wait(until.elementsLocated(By.css('div#authportal-center-section span + a#ap_change_login_claim')), this.config.timeout.elementLocated)
    }

    async populatePasswordThenSignIn() {
        const passwordInput = By.css('form[name="signIn"] input[type="password"]#ap_password')
        await this.driver.findElement(passwordInput).clear()
        await this.driver.findElement(passwordInput).sendKeys(this.config.password)

        await this.driver.findElement(By.css('form[name="signIn"] input[type="checkbox"]')).click()
        await this.driver.findElement(By.css('form[name="signIn"] input#signInSubmit')).click()
        await this.driver.wait(until.elementsLocated(By.css('header#navbar-main a#nav-logo-sprites')), this.config.timeout.pageLoad)
    }
}