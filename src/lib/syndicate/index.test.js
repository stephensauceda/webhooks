import { syndicate } from './index.js'
import { syndicateToMastodon } from './mastodon.js'
import { syndicateToBluesky } from './bluesky/index.js'

vi.mock('./mastodon.js', () => ({
  syndicateToMastodon: vi.fn().mockResolvedValue(true),
}))

vi.mock('./bluesky/index.js', () => ({
  syndicateToBluesky: vi.fn().mockResolvedValue(true),
}))

const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

beforeEach(() => {
  vi.resetAllMocks()
})

describe('syndicate', () => {
  test('logs when a service is not implemented', () => {
    expect.assertions(1)
    const post = {
      current: {
        slug: '/no-service',
        tags: [{ name: '#syndicate:foo' }],
      },
    }

    return syndicate(post).then(() => {
      expect(error).toHaveBeenCalledWith('Service foo not implemented.')
    })
  })

  test('call the service function when the service is implemented', async () => {
    expect.assertions(1)

    const post = {
      current: {
        slug: '/mastodon-success',
        tags: [{ name: '#syndicate:mastodon' }],
      },
    }

    syndicateToMastodon.mockResolvedValueOnce(
      `Syndicated ${post.current.slug} to mastodon.`
    )

    await syndicate(post)
    expect(log).toHaveBeenCalledWith(
      `Syndicated ${post.current.slug} to mastodon.`
    )
  })

  test('logs when the service call fails', async () => {
    syndicateToMastodon.mockRejectedValueOnce(
      'Failed to syndicate to mastodon: something went wrong'
    )
    expect.assertions(1)

    const post = {
      current: {
        slug: '/mastodon-fail',
        tags: [{ name: '#syndicate:mastodon' }],
      },
    }

    await syndicate(post)
    expect(error).toHaveBeenCalledWith(
      `Failed to syndicate to mastodon: something went wrong`
    )
  })

  test('rejects when no services are found', () => {
    expect.assertions(1)

    const post = {
      current: {
        slug: '/no-service',
        tags: [],
      },
    }

    return syndicate(post).catch(error => {
      expect(error).toBe('No services to syndicate.')
    })
  })

  describe('Bluesky', () => {
    test('syndicates to Bluesky', async () => {
      const post = {
        current: {
          url: 'https://example.com',
          custom_excerpt: 'Custom Excerpt',
          title: 'Post Title',
          slug: 'post-slug',
          tags: [{ name: '#syndicate:bluesky' }],
        },
      }

      syndicateToBluesky.mockResolvedValueOnce(
        `Syndicated ${post.current.slug} to Bluesky.`
      )

      await syndicate(post)
      expect(log).toHaveBeenCalledWith(
        `Syndicated ${post.current.slug} to Bluesky.`
      )
    })

    test('logs when the service call fails', async () => {
      syndicateToBluesky.mockRejectedValueOnce(
        'Failed to syndicate to Bluesky: something went wrong'
      )
      expect.assertions(1)

      const post = {
        current: {
          url: 'https://example.com',
          custom_excerpt: 'Custom Excerpt',
          title: 'Post Title',
          slug: 'post-slug',
          tags: [{ name: '#syndicate:bluesky' }],
        },
      }

      await syndicate(post)
      expect(error).toHaveBeenCalledWith(
        `Failed to syndicate to Bluesky: something went wrong`
      )
    })
  })
})
