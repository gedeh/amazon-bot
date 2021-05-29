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
  const { price, merchant, isOutOfStock, isQualifiedToBuy } = opts
  if (isOutOfStock) return { decision: false, message: 'its out of stock' }
  if (price > config.maxPrice) return { decision: false, message: 'its too expensive' }
  if (!config.trustedMerchants.includes(merchant)) return { decision: false, message: 'its not sold by trusted merchant(s)' }
  return { decision: isQualifiedToBuy, message: isQualifiedToBuy ? '' : 'account is qualified to buy' }
}

const describe = opts => {
  const { amazonId, title, price, merchant, isOutOfStock, isQualifiedToBuy } = opts
  if (!isOutOfStock) {
    if (isQualifiedToBuy) {
      return `Product ${amazonId} - ${title}: Price ${config.currency}${price} is sold by ${merchant}`
    }
    else return `Product ${amazonId} - ${title}: Account is not qualified to buy`
  }
  else return `Product ${amazonId} - ${title}: Is out of stock`
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
      await productPage.open()

      const title = await productPage.title()
      const price = await productPage.price()
      const merchant = await productPage.merchantName()
      const isOutOfStock = await productPage.isOutOfStock()
      const isQualifiedToBuy = await productPage.isQualifiedToBuy()
      const opts = { amazonId, title, price, merchant, isOutOfStock, isQualifiedToBuy }

      logger.info(describe(opts))

      const { decision, message } = shouldBuy(opts)

      if (decision) logger.info(`Product ${amazonId} - ${title}: Should buy it`)
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
