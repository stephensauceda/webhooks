/* v8 ignore start */
import Cloudflare from 'cloudflare'

const CloudflareClient = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_API_TOKEN
})

export default { CloudflareClient }
/* v8 ignore end */
