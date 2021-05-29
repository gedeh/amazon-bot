import dotenv from 'dotenv'
dotenv.config({ debug: true })

const env = process.env

if (!env.AMAZON_USERNAME || !env.AMAZON_PASSWORD) throw new Error('Configure environment variable AMAZON_USERNAME and AMAZON_PASSWORD')

const config = {
    timeout: env.TIMEOUT ?? 10000,
    maxPrice: env.MAXIMUM_PRICE ?? 2000,

    site: env.AMAZON_SITE ?? 'https://www.amazon.co.uk',
    locale: env.AMAZON_LOCALE ?? 'en-GB',
    currency: env.AMAZON_CURRENCY ?? '£',
    username: env.AMAZON_USERNAME,
    password: env.AMAZON_PASSWORD,
    amazonIds: [
        'B08HM4V2DH', // out of stock
        'B092CYHPDJ', // seller not by Amazon
        'B08LTKLG5K', // not qualified to buy
        'B078X22YBR', // sold by Amazon
        'B08N5TG1H3', // sold by Amazon
    ],
    trustedMerchants: [
        'Amazon',
        'TechPoint1111'
    ]
}

export default config
