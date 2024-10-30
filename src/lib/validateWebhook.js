import crypto from 'crypto'

const secret = process.env.GHOST_WEBHOOK_SECRET

export function validateWebhook(req) {
  const signature = req.headers['x-ghost-signature']
  if (!signature) {
    return false
  }

  const payload = req.body
  const [hash, timestamp] = signature.split(',')
  const [algo] = hash.split('=')
  const [, t] = timestamp.split('=')
  const ts = parseInt(t, 10)
  const generatedSignature = `${algo}=${crypto
    .createHmac(algo, secret)
    .update(`${JSON.stringify(payload)}${ts}`)
    .digest('hex')}, t=${ts}`

  return generatedSignature === signature
}

export default validateWebhook
