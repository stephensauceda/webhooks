import { vi, beforeEach, afterEach, expect } from 'vitest'
import { ghostSyndicate } from './index'
import { syndicate } from './lib/syndicate/index.js'
import { validateWebhook } from './lib/validateWebhook.js'

beforeEach(() => {
  vi.mock('./lib/validateWebhook', () => ({
    validateWebhook: vi.fn(),
  }))

  vi.mock('./lib/syndicate', () => ({
    syndicate: vi.fn().mockResolvedValue(true),
  }))
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('does not allow unauthorized requests', async () => {
  validateWebhook.mockReturnValue(false)
  const req = { headers: {}, body: {} }
  const res = { status: vi.fn(() => res), send: vi.fn() }

  await ghostSyndicate(req, res)
  expect(res.status).toHaveBeenCalledWith(401)
  expect(res.send).toHaveBeenCalledWith('Unauthorized')
})

test.each(['GET', 'DELETE', 'PUT', 'PATCH'])(
  'does not allow %s requests',
  async method => {
    validateWebhook.mockReturnValue(true)
    vi.spyOn(console, 'error')

    const req = { method, body: {} }
    const res = { status: vi.fn(() => res), send: vi.fn() }

    await ghostSyndicate(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.send).toHaveBeenCalledWith('Method not allowed')
  }
)

test('returns 200 for unknown paths', async () => {
  validateWebhook.mockReturnValue(true)
  const req = { method: 'POST', body: {}, path: '/foo' }
  const res = { status: vi.fn(() => res), send: vi.fn() }

  await ghostSyndicate(req, res)
  expect(res.status).toHaveBeenCalledWith(200)
  expect(res.send).toHaveBeenCalledWith('OK')
  expect(syndicate).not.toHaveBeenCalled()
})

test('syndicates a post', async () => {
  validateWebhook.mockReturnValue(true)
  const req = {
    method: 'POST',
    body: { post: { title: 'foo' } },
    path: '/syndicate',
  }
  const res = {
    status: vi.fn(() => res),
    send: vi.fn(),
  }

  await ghostSyndicate(req, res)
  expect(syndicate).toHaveBeenCalledWith(req.body.post)
  expect(res.status).toHaveBeenCalledWith(200)
  expect(res.send).toHaveBeenCalledWith('OK')
})

test('catches errors for syndication', async () => {
  validateWebhook.mockReturnValue(true)
  syndicate.mockRejectedValue('rejected')
  const req = {
    method: 'POST',
    body: { post: { title: 'foo' } },
    path: '/syndicate',
  }
  const res = {
    status: vi.fn(() => res),
    send: vi.fn(),
  }

  const error = vi.spyOn(console, 'error').mockReturnThis()

  await ghostSyndicate(req, res)
  await expect(syndicate).rejects.toEqual('rejected')
  expect(syndicate).toHaveBeenCalledWith(req.body.post)
  expect(res.status).toHaveBeenCalledWith(200)
  expect(res.send).toHaveBeenCalledWith('OK')
  expect(error).toHaveBeenCalledWith('rejected')
})
