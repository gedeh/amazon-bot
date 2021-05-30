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
        logger.info(`Product ${amazonId} - ${title}: Should buy it`)

        const { success: bought, address, paymentMethod, totalPrice } = await productPage.performBuy()
        if (bought) logger.info(
`Product ${amazonId} is bought with details:
  Shipping address: ${address.replace('\n', '. ')}
  Payment method: ${paymentMethod.replace('\n', '. ')}
  Total price: ${totalPrice}`)
      }
      else logger.warn(`Product ${amazonId} - ${title}: Do not buy it, ${message}`)
    }
  } finally {
    const stdin = process.openStdin()
    process.stdout.write('Press enter when complete...\n')
    stdin.addListener('data', () => {
      stdin.pause()
      driver.quit()
    })
  }
})()
