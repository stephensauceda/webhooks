const MASTODON_ACCESS_TOKEN = 'l-uppzBbzsfm3MYfA2JxXf3VZ5jAZxTiI9l2viV0m5s'
export const MASTODON_API_URL = 'https://mastodon.online/api/v1/statuses'

export function syndicateToMastodon(post) {
  const {
    current: { url, custom_excerpt, title, slug },
  } = post

  return fetch(MASTODON_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MASTODON_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      status: `${custom_excerpt || title} ${url}`,
    }),
  }).then(async response => {
    if (!response.ok) {
      const { error } = await response.json()
      return Promise.reject(`Failed to syndicate to Mastodon: ${error}`)
    }

    return `Syndicated ${slug} to Mastodon.`
  })
}

export default syndicateToMastodon
