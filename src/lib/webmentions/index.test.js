import { sendWebmentions } from './index.js'

describe('sendWebmentions', () => {
  vi.spyOn(console, 'log').mockImplementation(() => null)
  const originalFetch = global.fetch
  const WEBMENTIONS_ENDPOINT = 'https://webmention.app/check'

  beforeEach(() => {
    global.fetch = vi.fn()
    process.env.WEBMENTION_APP_TOKEN = 'test-token'
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  test('rejects with a message if no URL is provided', async () => {
    const post = { current: {} }
    await expect(sendWebmentions(post)).rejects.toThrow(
      'Missing URL for sending webmentions'
    )
  })

  test('sends webmentions and log the results', async () => {
    const post = { current: { url: 'https://example.com' } }
    const mockResponse = {
      ok: true,
      json: async () => ({
        urls: [{ target: 'https://target.com', status: 'success' }]
      })
    }
    global.fetch.mockResolvedValue(mockResponse)

    const result = await sendWebmentions(post)
    expect(result).toBe('Sent 1 webmentions for https://example.com')
    expect(global.fetch).toHaveBeenCalledWith(
      `${WEBMENTIONS_ENDPOINT}?url=https%3A%2F%2Fexample.com&token=test-token`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })

  test('rejects with an error message if the fetch fails', async () => {
    const post = { current: { url: 'https://example.com' } }
    const mockResponse = { ok: false, status: 500 }
    global.fetch.mockResolvedValue(mockResponse)

    await expect(sendWebmentions(post)).rejects.toThrow(
      'Failed to send webmentions: 500'
    )
  })

  test('should reject with an error message if the webmention.app API returns an error', async () => {
    const post = { current: { url: 'https://example.com' } }
    const mockResponse = {
      ok: true,
      json: async () => ({ error: 'test error' })
    }
    global.fetch.mockResolvedValue(mockResponse)

    await expect(sendWebmentions(post)).rejects.toThrow(
      'There was an error from the webmention.app API'
    )
  })
})
