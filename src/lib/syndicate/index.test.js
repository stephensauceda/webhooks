import syndicate from './index.js'
import { syndicateToMastodon } from './mastodon.js'

vi.mock('./mastodon.js', () => ({
  syndicateToMastodon: vi.fn(),
}))

const error = vi.spyOn(console, 'error').mockImplementation(() => null)
const log = vi.spyOn(console, 'log').mockImplementation(() => null)

afterEach(() => {
  vi.restoreAllMocks()
})

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

test.only('call the service function when the service is implemented', () => {
  expect.assertions(1)

  const post = {
    current: {
      slug: '/mastodon-success',
      tags: [{ name: '#syndicate:mastodon' }],
    },
  }

  syndicateToMastodon.mockResolvedValue(
    `Syndicated ${post.current.slug} to mastodon.`
  )

  return syndicate(post).then(() => {
    expect(log).toHaveBeenCalledWith(
      `Syndicated ${post.current.slug} to mastodon.`
    )
  })
})

test('logs when the service call fails', () => {
  syndicateToMastodon.mockRejectedValue(
    'Failed to syndicate to mastodon: something went wrong'
  )
  expect.assertions(1)

  const post = {
    current: {
      slug: '/mastodon-fail',
      tags: [{ name: '#syndicate:mastodon' }],
    },
  }

  return syndicate(post).then(() => {
    expect(error).toHaveBeenCalledWith(
      `Failed to syndicate to mastodon: something went wrong`
    )
  })
})
