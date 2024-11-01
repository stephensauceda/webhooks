import { send } from './index'

describe('webmentions', () => {
  describe('send', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => null)
    const originalFetch = global.fetch
    const WEBMENTIONS_ENDPOINT = 'https://webmention.app/check'

    beforeEach(() => {
      global.fetch = vi.fn()
      process.env.WEBMENTION_APP_TOKEN = 'test-token'
    })

    afterEach(() => {
      global.fetch = originalFetch
    })

    it('should resolve with a message if no URL is provided', async () => {
      const post = { current: {} }
      const result = await send(post)
      expect(result).toBe('No URL to send webmentions to')
    })

    it('should send webmentions and log the results', async () => {
      const post = { current: { url: 'https://example.com' } }
      const mockResponse = {
        ok: true,
        json: async () => ({
          urls: [{ target: 'https://target.com', status: 'success' }],
        }),
      }
      global.fetch.mockResolvedValue(mockResponse)

      const result = await send(post)
      expect(result).toBe('Sent 1 webmentions for https://example.com')
      expect(global.fetch).toHaveBeenCalledWith(
        `${WEBMENTIONS_ENDPOINT}?url=https%3A%2F%2Fexample.com&token=test-token`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(log).toHaveBeenCalledWith('success: https://target.com')
    })

    it('should reject with an error message if the fetch fails', async () => {
      const post = { current: { url: 'https://example.com' } }
      const mockResponse = { ok: false, status: 500 }
      global.fetch.mockResolvedValue(mockResponse)

      await expect(send(post)).rejects.toBe('Failed to send webmentions: 500')
    })
  })
})
