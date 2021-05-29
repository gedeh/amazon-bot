import { Builder } from 'selenium-webdriver';

import config from './config.mjs'
import AmazonMainPage from './page/AmazonMainPage.mjs';
import AmazonProductPage from './page/AmazonProductPage.mjs';

const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

(async function example() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    const mainPage = new AmazonMainPage(driver, config)
    const signInPage = await mainPage.openSignInPage()

    await signInPage.populateEmailThenContinue()
    await signInPage.populatePasswordThenSignIn()

    const randomizedIds = shuffle(config.amazonIds)
    for (const amazonId of randomizedIds) {
      console.info(`Opening page of product ${amazonId}`)
      const productPage = new AmazonProductPage(driver, config, amazonId)
      await productPage.open()
      const isOutOfStock = await productPage.isOutOfStock()
      if (!isOutOfStock) {
        const isQualifiedToBuy = await productPage.isQualifiedToBuy()
        if (isQualifiedToBuy) {
          const price = await productPage.price()
          const merchant = await productPage.merchantName()
          console.info(`> Product ${amazonId}: ${config.currency}${price} sold by ${merchant}`)
        }
        else console.warn(`> Product ${amazonId} is not qualified to buy`)
      }
      else console.warn(`> Product ${amazonId} is out of stock`)
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
