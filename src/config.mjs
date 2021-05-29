import dotenv from 'dotenv'
dotenv.config()

const env = process.env

const parseCommaSeparatedValues = (values, defaults = '') => {
    const merchants = values ?? defaults
    return merchants.split(',').map(e => e.trim())
}

if (!env.AMAZON_USERNAME || !env.AMAZON_PASSWORD) throw new Error('Configure environment variable AMAZON_USERNAME and AMAZON_PASSWORD')

const config = {
    timeout: env.TIMEOUT ?? 10000,
    maxPrice: env.MAXIMUM_PRICE ?? 2000,

    site: env.AMAZON_SITE ?? 'https://www.amazon.co.uk',
    locale: env.AMAZON_LOCALE ?? 'en-GB',
    currency: env.AMAZON_CURRENCY ?? '£',
    username: env.AMAZON_USERNAME,
    password: env.AMAZON_PASSWORD,
    amazonIds: parseCommaSeparatedValues(env.AMAZON_ITEMS_TO_BUY, ''),
    trustedMerchants: parseCommaSeparatedValues(env.AMAZON_TRUSTED_MERCHANTS, 'Amazon')
}

export default config
