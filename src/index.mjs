import { Builder } from 'selenium-webdriver';

import config from './config.mjs'
import AmazonMainPage from './page/AmazonMainPage.mjs';
import AmazonProductPage from './page/AmazonProductPage.mjs';

(async function example() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    const mainPage = new AmazonMainPage(driver, config)
    const signInPage = await mainPage.openSignInPage()

    await signInPage.populateEmailThenContinue()
    await signInPage.populatePasswordThenSignIn()

    config.amazonIds.map(async amazonId => {
      const productPage = new AmazonProductPage(driver, config, amazonId)
      await productPage.open()
    })
  } finally {
    const stdin = process.openStdin()
    process.stdout.write('Press enter when complete...')
    stdin.addListener('data', () => {
      stdin.pause()
      driver.quit()
    })
  }
})()
