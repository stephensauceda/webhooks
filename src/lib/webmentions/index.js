export async function sendWebmentions(post) {
  const WEBMENTIONS_ENDPOINT = 'https://webmention.app/check'

  if (!post?.current?.url) {
    throw new Error('Missing URL for sending webmentions')
  }

  const query = new URLSearchParams({
    url: post.current.url,
    token: process.env.WEBMENTION_APP_TOKEN
  }).toString()

  try {
    const response = await fetch(`${WEBMENTIONS_ENDPOINT}?${query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async response => {
      if (!response.ok) {
        throw new Error(`Failed to send webmentions: ${response.status}`)
      }

      const res = await response.json()
      if (res.error) {
        throw new Error('There was an error from the webmention.app API')
      }

      return res
    })

    const { urls: sentMentions } = response
    const message = `Sent ${sentMentions.length} webmentions for ${post.current.url}`

    console.log(message)

    return message
  } catch (error) {
    throw new Error(error.message, { cause: error })
  }
}
