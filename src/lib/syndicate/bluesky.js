import { AtpAgent, RichText } from '../../services/atproto.js'

export async function syndicateToBluesky(post) {
  const {
    current: { url, custom_excerpt, title, slug }
  } = post

  const rt = new RichText({
    text: `${custom_excerpt || title} ${url}`
  })

  try {
    await rt.detectFacets(AtpAgent)
    const response = await AtpAgent.post({
      text: rt.text,
      facets: rt.facets,
      langs: ['en-US'],
      createdAt: new Date().toISOString()
    }).then(res => {
      console.log(`Syndicated to Bluesky: ${slug}`)
      return res
    })

    return response
  } catch (error) {
    throw new Error(error.message)
  }
}
