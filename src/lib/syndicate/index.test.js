import { syndicate } from './index.js'
import { syndicateToMastodon } from './mastodon.js'
import { syndicateToBluesky } from './bluesky.js'

vi.mock('../../services/atproto.js', () => ({
  AtpAgent: {
    login: vi.fn()
  }
}))
vi.mock('./mastodon.js')
vi.mock('./bluesky.js')

const SERIVCES = {
  mastodon: syndicateToMastodon,
  bluesky: syndicateToBluesky
}

const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

describe('Syndicate', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test.each(Object.keys(SERIVCES))(
    'call the service function `%s` when the service is implemented',
    async service => {
      const post = {
        current: {
          slug: '/success',
          tags: [{ name: `#syndicate:${service}` }]
        }
      }

      await syndicate(post)
      expect(SERIVCES[service]).toHaveBeenCalledWith(post)
    }
  )

  test('logs when the service call fails', async () => {
    syndicateToMastodon.mockRejectedValueOnce(
      'Failed to syndicate to mastodon: something went wrong'
    )

    const post = {
      current: {
        slug: '/mastodon-fail',
        tags: [{ name: '#syndicate:mastodon' }]
      }
    }

    await syndicate(post)
    expect(error).toHaveBeenCalledWith(
      `Failed to syndicate to mastodon: something went wrong`
    )
  })

  test('returns early when no services are found', async () => {
    const post = {
      current: {
        slug: '/no-service',
        tags: []
      }
    }

    await syndicate(post)
    expect(log).toHaveBeenCalledWith('No services to syndicate. Ignoring.')
  })

  test('logs when a service is not implemented', async () => {
    const post = {
      current: {
        slug: '/no-service',
        tags: [{ name: '#syndicate:foo' }]
      }
    }

    await expect(syndicate(post)).rejects.toThrow(
      'Service foo not implemented.'
    )
  })
})
