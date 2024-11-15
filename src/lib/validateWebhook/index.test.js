import { validateWebhook } from './index.js'
import crypto from 'crypto'

vi.mock('crypto', () => ({
  default: {
    createHmac: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('validhash')
  }
}))

describe('validateWebhook', () => {
  test('should return true for a valid webhook', () => {
    const req = {
      headers: {
        'x-ghost-signature': 'sha256=validhash, t=1234567890'
      },
      body: { key: 'value' }
    }
    process.env.GHOST_WEBHOOK_SECRET = 'secret'
    const validHash = crypto
      .createHmac('sha256', 'secret')
      .update(`${JSON.stringify(req.body)}1234567890`)
      .digest('hex')
    req.headers['x-ghost-signature'] = `sha256=${validHash}, t=1234567890`

    const result = validateWebhook(req)
    expect(result).toBe(true)
  })

  test('should return false for an invalid webhook', () => {
    const req = {
      headers: {
        'x-ghost-signature': 'sha256=invalidhash, t=1234567890'
      },
      body: { key: 'value' }
    }
    process.env.GHOST_WEBHOOK_SECRET = 'secret'

    const result = validateWebhook(req)
    expect(result).toBe(false)
  })
})
