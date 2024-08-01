import { ghostSyndicate } from './index'
import { syndicate as s } from './lib/syndicate'

test.each(['GET', 'DELETE', 'PUT', 'PATCH'])(
  'does not allow %s requests',
  async method => {
    vi.spyOn(console, 'error')

    const req = { method }
    const res = { status: vi.fn(() => res), send: vi.fn() }

    await ghostSyndicate(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.send).toHaveBeenCalledWith('Method not allowed')
  }
)

test('syndicates a post', async () => {
  const req = { method: 'POST', body: { post: { title: 'foo' } } }
  const res = {
    status: vi.fn(() => res),
    send: vi.fn(),
  }

  vi.mock('./lib/syndicate', () => ({
    syndicate: vi.fn().mockResolvedValue(true),
  }))

  await ghostSyndicate(req, res)
  expect(s).toHaveBeenCalledWith(req.body.post)
  expect(res.status).toHaveBeenCalledWith(200)
  expect(res.send).toHaveBeenCalledWith('OK')
})

test('catches errors for syndication', async () => {
  const req = { method: 'POST', body: { post: { title: 'foo' } } }
  const res = {
    status: vi.fn(() => res),
    send: vi.fn(),
  }

  const error = vi.spyOn(console, 'error')

  vi.mock('./lib/syndicate', () => ({
    syndicate: vi.fn().mockRejectedValue('rejected'),
  }))

  await ghostSyndicate(req, res)
  await expect(s).rejects.toEqual('rejected')
  expect(s).toHaveBeenCalledWith(req.body.post)
  expect(res.status).toHaveBeenCalledWith(200)
  expect(res.send).toHaveBeenCalledWith('OK')
  expect(error).toHaveBeenCalledWith('rejected')
})
