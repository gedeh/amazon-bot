import { By, until } from 'selenium-webdriver'

export default class AmazonSignInPage {
    constructor(driver, config) {
        this.driver = driver
        this.config = config
    }

    async populateEmailThenContinue() {
        const emailInput = await this.driver.findElement(By.css('form[name="signIn"] input[type="email"]#ap_email'))
        await emailInput.clear()
        await emailInput.sendKeys(this.config.username)

        await this.driver.findElement(By.css('form[name="signIn"] input#continue')).click()
        await this.driver.wait(until.elementsLocated(By.css('div#authportal-center-section span + a#ap_change_login_claim')), this.config.timeout)
    }

    async populatePasswordThenSignIn() {
        const passwordInput = await this.driver.findElement(By.css('form[name="signIn"] input[type="password"]#ap_password'))
        await passwordInput.clear()
        await passwordInput.sendKeys(this.config.password)

        await this.driver.findElement(By.css('form[name="signIn"] input[type="checkbox"]')).click()
        await this.driver.findElement(By.css('form[name="signIn"] input#signInSubmit')).click()
        await this.driver.wait(until.elementsLocated(By.css('header#navbar-main a#nav-logo-sprites')), this.config.timeout)
    }
}