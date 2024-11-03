import { client as Cloudflare } from './cloudflare'

export async function purgeCache(payload) {
  const url = payload?.current?.url

  if (!url) {
    throw new Error('No payload provided to purgeCache.')
  }

  const files = [url]
  const zoneId = process.env.CLOUDFLARE_ZONE_ID

  try {
    const response = await Cloudflare.cache.purge({
      zone_id: zoneId,
      files,
    })

    return response
  } catch (error) {
    throw new Error(error.message, { cause: error })
  }
}
