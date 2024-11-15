import { syndicateToMastodon } from './mastodon.js'
import { syndicateToBluesky } from './bluesky.js'

const SERVICE_MAP = {
  mastodon: syndicateToMastodon,
  bluesky: syndicateToBluesky
}

export async function syndicate(post) {
  const {
    current: { tags }
  } = post

  // get all services we need call
  const servicesToSyndicate = tags
    .filter(t => t.name.startsWith('#syndicate:'))
    .map(t => t.name.split(':')[1])
    .map(service => {
      if (!SERVICE_MAP[service]) {
        throw new Error(`Service ${service} not implemented.`)
      }

      return SERVICE_MAP[service](post)
    })

  if (servicesToSyndicate.length === 0) {
    console.log('No services to syndicate. Ignoring.')
    return
  }

  try {
    const response = Promise.allSettled(servicesToSyndicate).then(results => {
      results.forEach(result => {
        if (result.status === 'rejected') {
          console.error(result.reason)
        } else {
          console.log(result.value)
        }
      })
    })

    return response
  } catch (error) {
    throw new Error(error.message, { cause: error })
  }
}
