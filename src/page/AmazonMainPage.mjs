import { By, until } from 'selenium-webdriver'
import AmazonSignInPage from './AmazonSignInPage.mjs'

export default class AmazonMainPage {
    constructor(driver, config) {
        this.driver = driver
        this.config = config
    }

    async openSignInPage() {
        await this.driver.get(this.config.site)
        await this.driver.findElement(By.css('header#navbar-main a[data-nav-role="signin"]')).click()
        await this.driver.wait(
            () => this.driver.executeScript('return document.readyState').then(
                async state => state === 'complete'), this.config.timeout.pageLoad)
        await this.driver.wait(until.elementLocated(By.css('form[name="signIn"] input[type="email"]#ap_email')), this.config.timeout.elementLocated)
        return new AmazonSignInPage(this.driver, this.config)
    }

    async searchFor(keyword) {
        const searchField = await this.driver.findElement(By.css('header#navbar-main form#nav-search-bar-form input[aria-label="Search"]'))
        await searchField.clear()
        await searchField.sendKeys(keyword)

        const goButton = await this.driver.findElement(By.css('header#navbar-main form#nav-search-bar-form div.nav-search-submit input#nav-search-submit-button'))
        await goButton.click()

        await this.driver.wait(until.elementsLocated(By.css('span[data-component-type="s-search-results"]')), this.config.timeout.pageLoad)
    }
}
