import { CloudflareClient } from '../../services/cloudflare.js'

export async function purge(payload) {
  const url = payload?.current?.url

  if (!url) {
    throw new Error('No payload provided to purgeCache.')
  }

  let files = [url]

  if (payload.purgeCollections === 'true') {
    const baseUrl = new URL(url).origin
    const tagUrls = (
      payload.current.tags?.filter(t => t.visibility === 'public') || []
    )
      .map(t => [t.url, `${t.url}rss/`]) // Ghost tag urls have a trailing slash already
      .flat()

    files = [...files, ...tagUrls, baseUrl, `${baseUrl}/rss/`]
  }

  const zoneId = process.env.CLOUDFLARE_ZONE_ID

  console.log('Purging cache for:', files.join(', '))
  try {
    const response = await CloudflareClient.cache.purge({
      zone_id: zoneId,
      files
    })
    console.log(response)
    return response
  } catch (error) {
    throw new Error(error.message, { cause: error })
  }
}
