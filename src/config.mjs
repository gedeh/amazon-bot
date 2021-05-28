import dotenv from 'dotenv'
dotenv.config({ debug: true, path: '../.env' })

const env = process.env

if (!env.AMAZON_USERNAME || !env.AMAZON_PASSWORD) throw new Error('Configure environment variable AMAZON_USERNAME and AMAZON_PASSWORD')

const config = {
    timeout: env.TIMEOUT ?? 10000,
    maxPrice: env.MAXIMUM_PRICE ?? 2000,

    site: env.AMAZON_SITE ?? 'https://www.amazon.de/',
    username: env.AMAZON_USERNAME,
    password: env.AMAZON_PASSWORD,
    amazonIds: [
        'B08HH1BMQQ',
        'B08HR55YB5',
        'B08LTKLG5K',
        'B08HM4V2DH',
        'B092CYHPDJ'
    ]
}

export default config
