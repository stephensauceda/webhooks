import Cloudflare from 'cloudflare'
export const client = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
})
