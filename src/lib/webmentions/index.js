export function send(post) {
  const WEBMENTIONS_ENDPOINT = 'https://webmention.app/check'

  if (!post?.current?.url) {
    return Promise.resolve('No URL to send webmentions to')
  }

  const query = new URLSearchParams({
    url: post.current.url,
    token: process.env.WEBMENTION_APP_TOKEN,
  }).toString()

  return fetch(`${WEBMENTIONS_ENDPOINT}?${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async response => {
    if (!response.ok) {
      return Promise.reject(`Failed to send webmentions: ${response.status}`)
    }

    const res = await response.json()
    if (res.error) {
      return Promise.reject(`There was an error from the webmention.app API`)
    }
    const { urls: sentMentions } = res
    const message = `Sent ${sentMentions.length} webmentions for ${post.current.url}`

    console.log(message)

    sentMentions.forEach(({ target, status }) => {
      console.log(`${status}: ${target}`)
    })

    return message
  })
}
