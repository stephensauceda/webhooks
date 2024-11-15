import { MASTODON_API_URL, syndicateToMastodon } from './mastodon.js'

const post = {
  current: {
    url: 'https://example.com/foo',
    custom_excerpt: 'excerpt',
    title: 'title',
    slug: '/foo'
  }
}

global.fetch = vi.fn()
vi.spyOn(console, 'log').mockResolvedValue()
vi.stubEnv('MASTODON_ACCESS_TOKEN', 'token')

describe('Mastodon', () => {
  beforeEach(() => {
    global.fetch.mockReset()
  })

  test('makes a POST request to the MASTODON API', async () => {
    fetch.mockResolvedValue({ ok: true })
    await syndicateToMastodon(post)
    expect(fetch).toHaveBeenCalledWith(MASTODON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer token`
      },
      body: JSON.stringify({
        status: `${post.current.custom_excerpt} ${post.current.url}`
      })
    })

    expect(console.log).toHaveBeenCalledWith(
      `Syndicated to Mastodon: ${post.current.slug}`
    )
  })

  test('resolves with syndication message when successful', async () => {
    fetch.mockResolvedValue({ ok: true })
    await syndicateToMastodon(post)

    expect(console.log).toHaveBeenCalledWith(
      `Syndicated to Mastodon: ${post.current.slug}`
    )
  })

  test('rejects to failed syndication message when unsuccessful', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'something went wrong' })
    })

    await expect(syndicateToMastodon(post)).rejects.toThrow(
      `Failed to syndicate to Mastodon: something went wrong`
    )
  })
})
