import { syndicateToMastodon } from './mastodon.js'
import { syndicateToBluesky } from './bluesky/index.js'

const SERVICE_MAP = {
  mastodon: syndicateToMastodon,
  bluesky: syndicateToBluesky,
}

export function syndicate(post) {
  const {
    current: { tags },
  } = post

  // get all services we need call
  const servicesToSyndicate = tags
    .filter(t => t.name.startsWith('#syndicate:'))
    .map(t => t.name.split(':')[1])
    .map(service => {
      if (!SERVICE_MAP[service]) {
        return Promise.reject(`Service ${service} not implemented.`)
      }

      return SERVICE_MAP[service](post)
    })

  if (servicesToSyndicate.length === 0) {
    return Promise.reject('No services to syndicate.')
  }

  return Promise.allSettled(servicesToSyndicate)
    .then(results => {
      results.forEach(result => {
        if (result.status === 'rejected') {
          console.error(result.reason)
        } else {
          console.log(result.value)
        }
      })
    })
    .catch(error => {
      console.error(error.message)
    })
}

export default syndicate
