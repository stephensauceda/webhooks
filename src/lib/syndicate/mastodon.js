export const MASTODON_API_URL = 'https://mastodon.online/api/v1/statuses'

export async function syndicateToMastodon(post) {
  const {
    current: { url, custom_excerpt, title, slug }
  } = post

  try {
    const response = await fetch(MASTODON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        status: `${custom_excerpt || title} ${url}`
      })
    }).then(async res => {
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(`Failed to syndicate to Mastodon: ${error}`)
      }

      console.log(`Syndicated to Mastodon: ${slug}`)
    })

    return response
  } catch (error) {
    throw new Error(error.message, { cause: error })
  }
}

export default syndicateToMastodon
