import dotenv from 'dotenv'
dotenv.config()

const env = process.env

const parseCommaSeparatedValues = (values, defaults = '') => {
    const merchants = values ?? defaults
    const parsed = merchants.split(',').map(e => e.trim())
    if (defaults !== '') parsed.push(defaults)
    return parsed
}

const ensureInt = (value, defaults) => {
    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaults : parsed
}

if (!env.AMAZON_USERNAME) throw new Error("Configure environment variable AMAZON_USERNAME with your Amazon email")
if (!env.AMAZON_PASSWORD) throw new Error("Configure environment variable AMAZON_PASSWORD with your Amazon password")
if (!env.AMAZON_ITEMS_TO_BUY) throw new Error('Configure environment variable AMAZON_ITEMS_TO_BUY with comma separated ASIN')

const mainMerchant = env.AMAZON_MAIN_MERCHANT ?? 'Amazon'
const trustedMerchants = parseCommaSeparatedValues(env.AMAZON_TRUSTED_MERCHANTS, mainMerchant)

const config = {
    timeout: {
        pageLoad: ensureInt(env.TIMEOUT_PAGE_LOAD, 10) * 1000,
        elementLocated: ensureInt(env.TIMEOUT_ELEMENT_LOCATED, 5) * 1000
    },
    maxPrice: ensureInt(env.MAXIMUM_PRICE, 2000),
    interval: {
        min: ensureInt(env.CHECK_INTERVAL_MIN, 10),
        max: ensureInt(env.CHECK_INTERVAL_MAX, 30)
    },

    site: env.AMAZON_SITE ?? 'https://www.amazon.co.uk',
    locale: env.AMAZON_LOCALE ?? 'en-GB',
    currency: env.AMAZON_CURRENCY ?? '£',

    username: env.AMAZON_USERNAME,
    password: env.AMAZON_PASSWORD,

    doBuy: (env.AMAZON_PERFORM_BUY ?? 'true') === 'true',

    amazonIds: parseCommaSeparatedValues(env.AMAZON_ITEMS_TO_BUY, ''),
    mainMerchant,
    trustedMerchants
}

export default config
