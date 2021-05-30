import { Builder } from 'selenium-webdriver';

import config from './config.mjs'
import logger from './logger.mjs'
import AmazonMainPage from './page/AmazonMainPage.mjs';
import AmazonProductPage from './page/AmazonProductPage.mjs';

const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

const shouldBuy = opts => {
  const { price, merchant, isOutOfStock, isQualifiedToBuy, isDeliverable } = opts
  if (isOutOfStock) return { success: false, message: 'its out of stock' }
  if (!isQualifiedToBuy) return { success: false, message: 'account is not qualified to buy' }
  if (!isDeliverable) return { success: false, message: 'its not deliverable to main address' }

  if (!config.trustedMerchants.includes(merchant)) return { success: false, message: 'its not sold by trusted merchant(s)' }
  if (price > config.maxPrice) return { success: false, message: 'its too expensive' }

  return { success: true }
}

const describe = opts => {
  const { amazonId, title, price, merchant, isOutOfStock, isQualifiedToBuy, isDeliverable } = opts
  if (isOutOfStock) return `Product ${amazonId} - ${title}: Is out of stock`
  if (!isQualifiedToBuy) return `Product ${amazonId} - ${title}: Account is not qualified to buy`
  if (!isDeliverable) return `Product ${amazonId} - ${title}: Cannot be shipped to selected delivery location`

  return `Product ${amazonId} - ${title}: Price ${config.currency}${price} is sold by ${merchant}`
}

const logPurchase = details => {
  logger.info(
`Product ${details.amazonId} is bought with details:
  Shipping address: ${details.address.replace('\n', '. ')}
  Payment method: ${details.paymentMethod.replace('\n', '. ')}
  Total price: ${details.totalPrice}
  Confirmed shipping address: ${details.shipping.replace('\n', '. ')}`)
}

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async function example() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    logger.info(`Opening Amazon main page ${config.site}`)
    const mainPage = new AmazonMainPage(driver, config)
    const signInPage = await mainPage.openSignInPage()

    logger.info(`Sign in to Amazon`)
    await signInPage.populateEmailThenContinue()
    await signInPage.populatePasswordThenSignIn()

    const randomizedIds = shuffle(config.amazonIds)
    for (const amazonId of randomizedIds) {
      logger.info(`Opening page of product ${amazonId}`)
      const productPage = new AmazonProductPage(driver, config, amazonId)
      const available = await productPage.open()
      if (!available) {
        logger.warn(`Product ${amazonId} is not available`)
        continue
      }

      const title = await productPage.title()
      const price = await productPage.price()
      const merchant = await productPage.merchantName()
      const isOutOfStock = await productPage.isOutOfStock()
      const isQualifiedToBuy = await productPage.isQualifiedToBuy()
      const isDeliverable = await productPage.isDeliverable()
      const opts = { amazonId, title, price, merchant, isOutOfStock, isQualifiedToBuy, isDeliverable }

      logger.info(describe(opts))
      const { success: shouldBuyIt, message } = shouldBuy(opts)

      if (shouldBuyIt) {
        logger.info(`Product ${amazonId}: Should buy it`)
        if (config.doBuy) {
          const { success: bought, address, shipping, paymentMethod, totalPrice, error } = await productPage.performBuy()
          if (bought) {
            const details = { amazonId, address, shipping, paymentMethod, totalPrice }
            logPurchase(details)
          }
          else logger.error(`Something wrong when performing Buy Now action in Amazon`, error)
        }
      }
      else logger.warn(`Product ${amazonId} - ${title}: Do not buy it, ${message}`)
    }
  }
  finally {
    const sleepFor = Math.floor(Math.random() * 60) + 45
    logger.info(`Sleep for ${sleepFor} second(s) before exit...`)
    await sleep(sleepFor + 1000)

    driver.quit()
  }
})()
