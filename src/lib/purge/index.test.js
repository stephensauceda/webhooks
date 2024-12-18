import { CloudflareClient } from '../../services/cloudflare.js'
import { purge } from './index.js'

vi.mock('../../services/cloudflare.js', () => ({
  CloudflareClient: {
    cache: {
      purge: vi.fn()
    }
  }
}))

vi.spyOn(console, 'log').mockImplementation(() => null)

describe('Purge', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('throws an error with no payload', async () => {
    await expect(purge()).rejects.toThrow('No payload provided to purgeCache.')
  })

  test('throws an error with no URL', async () => {
    await expect(purge({})).rejects.toThrow(
      'No payload provided to purgeCache.'
    )
  })

  test('purges a single URL', async () => {
    vi.stubEnv('CLOUDFLARE_ZONE_ID', '12345')
    const url = 'https://example.com'

    await purge({ current: { url } })

    expect(CloudflareClient.cache.purge).toHaveBeenCalledWith({
      zone_id: '12345',
      files: [url]
    })
  })

  test('purges collections', async () => {
    vi.stubEnv('CLOUDFLARE_ZONE_ID', '12345')
    const url = 'https://example.com/my-post'
    const payload = {
      current: {
        url,
        tags: [
          {
            visibility: 'public',
            url: 'https://example.com/tag1/'
          },
          {
            visibility: 'internal',
            url: '404'
          }
        ]
      },
      purgeCollections: 'true'
    }

    const collection = [
      url,
      'https://example.com/tag1/',
      'https://example.com/tag1/rss/',
      'https://example.com',
      'https://example.com/rss/'
    ]

    await purge(payload)

    expect(CloudflareClient.cache.purge).toHaveBeenCalledWith({
      zone_id: '12345',
      files: expect.arrayContaining(collection)
    })
  })

  test('throws an error when purging fails', async () => {
    vi.stubEnv('CLOUDFLARE_ZONE_ID', '12345')
    const url = 'https://example.com'
    const error = new Error('Purge failed')
    CloudflareClient.cache.purge.mockRejectedValue(error)

    await expect(purge({ current: { url } })).rejects.toThrow('Purge failed')
  })

  test('return the response from Cloudflare when purging is successful', async () => {
    vi.stubEnv('CLOUDFLARE_ZONE_ID', '12345')
    const url = 'https://example.com'
    const response = { success: true }
    CloudflareClient.cache.purge.mockResolvedValue(response)

    await expect(purge({ current: { url } })).resolves.toEqual(response)
  })
})
