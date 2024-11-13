import { RichText } from '@atproto/api'
import { agent } from './atProto.js'

export async function syndicateToBluesky(post) {
  const {
    current: { url, custom_excerpt, title, slug },
  } = post

  const rt = new RichText({
    text: `${custom_excerpt || title} ${url}`,
  })

  await rt.detectFacets(agent)

  return agent
    .post({
      text: rt.text,
      facets: rt.facets,
      langs: ['en-US'],
      createdAt: new Date().toISOString(),
    })
    .then(() => {
      return `Syndicated ${slug} to Bluesky.`
    })
}
