/* v8 ignore start */
import Cloudflare from 'cloudflare'

export const CloudflareClient = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN
})
/* v8 ignore end */
