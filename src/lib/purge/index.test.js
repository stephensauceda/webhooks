import { client as Cloudflare } from './cloudflare.js'
import { purgeCache } from './index.js'

vi.mock('./cloudflare.js', () => ({
  client: {
    cache: {
      purge: vi.fn(),
    },
  },
}))

vi.spyOn(console, 'log').mockImplementation(() => null)

beforeEach(() => {
  vi.resetAllMocks()
})

describe('purgeCache', () => {
  test('throws an error with no payload', async () => {
    await expect(purgeCache()).rejects.toThrow(
      'No payload provided to purgeCache.'
    )
  })

  test('throws an error with no URL', async () => {
    await expect(purgeCache({})).rejects.toThrow(
      'No payload provided to purgeCache.'
    )
  })

  test('purges a single URL', async () => {
    vi.stubEnv('CLOUDFLARE_ZONE_ID', '12345')
    const url = 'https://example.com'

    await purgeCache({ current: { url } })

    expect(Cloudflare.cache.purge).toHaveBeenCalledWith({
      zone_id: '12345',
      files: [url],
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
            url: 'https://example.com/tag1/',
          },
          {
            visibility: 'internal',
            url: '404',
          },
        ],
      },
      purgeCollections: 'true',
    }

    const collection = [
      url,
      'https://example.com/tag1/',
      'https://example.com/tag1/rss/',
      'https://example.com',
      'https://example.com/rss/',
    ]

    await purgeCache(payload)

    expect(Cloudflare.cache.purge).toHaveBeenCalledWith({
      zone_id: '12345',
      files: expect.arrayContaining(collection),
    })
  })

  test('throws an error when purging fails', async () => {
    vi.stubEnv('CLOUDFLARE_ZONE_ID', '12345')
    const url = 'https://example.com'
    const error = new Error('Purge failed')
    Cloudflare.cache.purge.mockRejectedValue(error)

    await expect(purgeCache({ current: { url } })).rejects.toThrow(
      'Purge failed'
    )
  })

  test('return the response from Cloudflare when purging is successful', async () => {
    vi.stubEnv('CLOUDFLARE_ZONE_ID', '12345')
    const url = 'https://example.com'
    const response = { success: true }
    Cloudflare.cache.purge.mockResolvedValue(response)

    await expect(purgeCache({ current: { url } })).resolves.toEqual(response)
  })
})
