import { By, until, ThenableWebDriver } from 'selenium-webdriver'
import config from '../config.mjs'

const getSeparator = (locale, separatorType) => {
    const numberWithGroupAndDecimalSeparator = 1000.1;
    return Intl.NumberFormat(locale)
        .formatToParts(numberWithGroupAndDecimalSeparator)
        .find(part => part.type === separatorType)
        .value;
}

const unformatPrice = (locale, currencySymbol, price) => {
    const decimal = getSeparator(locale, 'decimal')
    const group = getSeparator(locale, 'group')
    return price.replace(group, '').replace(decimal, '.').replace(currencySymbol, '')
}

export default class AmazonProductPage {

    /**
     * @param {ThenableWebDriver} driver
     * @param {config} config
     * @param {String} amazonId
     */
    constructor(driver, config, amazonId) {
        this.driver = driver
        this.config = config
        this.amazonId = amazonId
    }

    async open() {
        try {
            await this.driver.get(`${this.config.site}/-/en/dp/${this.amazonId}`)
            await this.driver.wait(
                () => this.driver.executeScript('return document.readyState').then(
                    async state => state === 'complete'), this.config.timeout)
            await this.driver.wait(until.elementsLocated(By.css('div[data-feature-name="desktop_buybox"]')), this.config.timeout)
            await this.driver.wait(until.elementsLocated(By.css('span#productTitle')), this.config.timeout)
            return true
        }
        catch {
            return false
        }
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
            const { locale, currency } = this.config
            return unformatPrice(locale, currency, price)
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

    async performBuy() {
        try {
            const buyNowButton = await this.driver.findElement(By.css('div#desktop_qualifiedBuyBox div#buyNow input[type="submit"]#buy-now-button'))
            await buyNowButton.click()

            await this.driver.wait(until.elementsLocated(By.css('div.a-popover-modal div#turbo-checkout-modal-header')), this.config.timeout)
            await this.driver.wait(until.elementsLocated(By.css('iframe#turbo-checkout-iframe')), this.config.timeout)

            const buyNowDialog = await this.driver.findElement(By.css('iframe#turbo-checkout-iframe'))
            await this.driver.switchTo().frame(buyNowDialog)
            await this.driver.wait(until.elementsLocated(By.css('div[cel_widget_id="turbo-cel-ship-panel"]')), this.config.timeout)

            const address = await this.driver.findElement(By.css('div[cel_widget_id="turbo-cel-address-panel"] div.aok-nowrap.a-col-right')).getText()
            const paymentMethod = await this.driver.findElement(By.css('div[cel_widget_id="turbo-cel-pay-panel"] div.aok-nowrap.a-col-right')).getText()
            const totalPrice = await this.driver.findElement(By.css('div[cel_widget_id="turbo-cel-price-panel"] div.aok-nowrap.a-col-right')).getText()

            await this.driver.findElement(By.css('form#place-order-form input[type="submit"][id="turbo-checkout-pyo-button"]')).click()

            await this.driver.switchTo().parentFrame()
            await this.driver.wait(until.elementsLocated(By.css('div[id="checkoutpage"][pagename="thankyoupage"]')), this.config.timeout)
            const shipping = await this.driver.findElement(By.css('div[id="widget-purchaseSummary"] div[cel_widget_id="typ-shipmentText-0"]')).getText()

            const { locale, currency } = this.config
            return { success: true, address, shipping, paymentMethod, totalPrice: unformatPrice(locale, currency, totalPrice) }
        }
        catch (e) {
            return { success: false, error: e }
        }
    }
}