import { syndicateToMastodon } from './mastodon'

const SERVICE_MAP = {
  mastodon: syndicateToMastodon,
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
