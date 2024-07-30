import { MASTODON_API_URL, syndicateToMastodon } from './mastodon'

const post = {
  current: {
    url: 'https://example.com/foo',
    custom_excerpt: 'excerpt',
    title: 'title',
    slug: '/foo',
  },
}

vi.stubEnv('MASTODON_ACCESS_TOKEN', 'token')
global.fetch = vi.fn()

afterEach(() => {
  vi.restoreAllMocks()
})

test('makes a POST request to the MASTODON API', async () => {
  expect.assertions(1)
  fetch.mockResolvedValue({ ok: true })
  await syndicateToMastodon(post)
  expect(fetch).toHaveBeenCalledWith(MASTODON_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer token`,
    },
    body: JSON.stringify({
      status: `${post.current.custom_excerpt} ${post.current.url}`,
    }),
  })
})

test('solves with syndication message when successful', async () => {
  expect.assertions(1)
  fetch.mockResolvedValue({ ok: true })
  await expect(syndicateToMastodon(post)).resolves.toBe(
    `Syndicated ${post.current.slug} to Mastodon.`
  )
})

test('rejects to failed syndication message when unsuccessful', async () => {
  expect.assertions(1)
  fetch.mockResolvedValue({
    ok: false,
    json: () => Promise.resolve({ error: 'something went wrong' }),
  })

  await expect(syndicateToMastodon(post)).rejects.toBe(
    `Failed to syndicate to Mastodon: something went wrong`
  )
})
