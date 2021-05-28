import { By, until } from 'selenium-webdriver'

export default class AmazonProductPage {

    constructor(driver, config, amazonId) {
        this.driver = driver
        this.config = config
        this.amazonId = amazonId
    }

    async open() {
        await this.driver.get(`${this.config.site}/-/en/dp/${this.amazonId}`)
    }
}