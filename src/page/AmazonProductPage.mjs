import { By, until } from 'selenium-webdriver'

const getSeparator = (locale, separatorType) => {
    const numberWithGroupAndDecimalSeparator = 1000.1;
    return Intl.NumberFormat(locale)
        .formatToParts(numberWithGroupAndDecimalSeparator)
        .find(part => part.type === separatorType)
        .value;
}

export default class AmazonProductPage {

    constructor(driver, config, amazonId) {
        this.driver = driver
        this.config = config
        this.amazonId = amazonId
    }

    async open() {
        await this.driver.get(`${this.config.site}/-/en/dp/${this.amazonId}`)
        await this.driver.wait(
            () => this.driver.executeScript('return document.readyState').then(
                async state => state === 'complete'), this.config.timeout)
        await this.driver.wait(until.elementsLocated(By.css('div[data-feature-name="desktop_buybox"]')), this.config.timeout)
        await this.driver.wait(until.elementsLocated(By.css('span#productTitle')), this.config.timeout)
    }

    async title() {
        return await this.driver.findElement(By.css('span#productTitle')).getText()
    }

    async isOutOfStock() {
        try {
            await this.driver.findElement(By.css('div#outOfStock'))
            return true
        }
        catch (e) {
            return false
        }
    }

    async isQualifiedToBuy() {
        try {
            await this.driver.findElement(By.css('div#unqualifiedBuyBox'))
            return false
        }
        catch (e) {
            return true
        }
    }

    async isDeliverable() {
        try {
            await this.driver.findElement(By.css('div#deliveryBlockMessage span.a-color-error'))
            return false
        }
        catch (e) {
            return true
        }
    }

    async isByAmazon() {
        try {
            const merchantName = await this.driver.findElement(By.css('div#merchant-info')).getText()
            return merchantName.toLowerCase() === 'dispatched from and sold by amazon.'
        }
        catch (e) {
            console.error(e)
            return false
        }
    }

    async price() {
        try {
            const price = await this.driver.findElement(By.css('span.header-price')).getText().catch(
                () => this.driver.findElement(By.css('div[data-feature-name="priceInsideBuyBox"] span#price_inside_buybox')).getText())
            const decimal = getSeparator(this.config.locale, 'decimal')
            const group = getSeparator(this.config.locale, 'group')
            return price.replace(group, '').replace(decimal, '.').replace(this.config.currency, '')
        }
        catch (e) {
            return 0
        }
    }

    async merchantLinkedName() {
        try {
            return await this.driver.findElement(By.css('div#merchant-info a#sellerProfileTriggerId')).getText()
        }
        catch (e) {
            return ""
        }
    }

    async merchantName() {
        try {
            const name = await this.merchantLinkedName()
            return name === "" ? ( await this.isByAmazon() ? 'Amazon' : 'Unknown' ) : name
        }
        catch (e) {
            return ""
        }
    }
}