# Amazon Selenium

Quick and dirty approach to use Selenium to browse Amazon product by their Amazon Standard Identification Number (ASIN). It will checks whether:

- Product is available
- Sold by Amazon
- Price is within range

When all above criteria are met, buy action will be performed automatically using configured account.

## To do

- [x] Login to Amazon
- [x] Browse product page
- [ ] Add to basket
- [ ] Buy item
- [ ] Keep loop in randomized time until an item is bought

## How to run

- Clone this repository
- Install latest [Node LTS](https://nodejs.org/en/)
- Create new `.env` file inside checkout dir, for example `~/path/to/checkout/dir/.env`
- Populate the new `.env` file with following values

    ```env
    AMAZON_USERNAME=your@email.com
    AMAZON_PASSWORD=YourPassword
    AMAZON_SITE=https://www.amazon.co.uk
    AMAZON_CURRENCY=£
    AMAZON_LOCALE=en-GB
    ```

    or for example for Amazon Germany

    ```env
    AMAZON_USERNAME=your@email.com
    AMAZON_PASSWORD=YourPassword
    AMAZON_SITE=https://www.amazon.de
    AMAZON_CURRENCY=€
    AMAZON_LOCALE=en-GB
    ```

    See [config](./src/config.mjs) for complete reference of available configuration like Amazon site to use, locale, and currency

- Run `npm install`
- Run the Selenium code using `npm run start`
