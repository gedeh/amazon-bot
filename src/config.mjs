import dotenv from 'dotenv'
dotenv.config()

const env = process.env

const parseCommaSeparatedValues = (values, defaults = '') => {
    const merchants = values ?? defaults
    const parsed = merchants.split(',').map(e => e.trim())
    if (defaults !== '') parsed.push(defaults)
    return parsed
}

if (!env.AMAZON_USERNAME || !env.AMAZON_PASSWORD) throw new Error('Configure environment variable AMAZON_USERNAME and AMAZON_PASSWORD')

const mainMerchant = env.AMAZON_MAIN_MERCHANT ?? 'Amazon'
const trustedMerchants = parseCommaSeparatedValues(env.AMAZON_TRUSTED_MERCHANTS, mainMerchant)

const config = {
    timeout: env.TIMEOUT ?? 10000,
    maxPrice: env.MAXIMUM_PRICE ?? 2000,

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
