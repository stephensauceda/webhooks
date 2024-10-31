import { syndicate } from './lib/syndicate/index.js'
import { validateWebhook } from './lib/validateWebhook.js'
import { send as sendWebmentions } from './lib/webmentions/index.js'

export const webhooks = async (req, res) => {
  const authorizedWebhook = validateWebhook(req)

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  if (!authorizedWebhook) {
    res.status(401).send('Unauthorized')
    return
  }

  const { path } = req
  // Ghost sends pretty much the same data for all webhooks,
  // but the top-level key changes depending on the content type
  const payload = Object.values(req.body)[0]

  try {
    switch (path) {
      case '/syndicate':
        await syndicate(payload)
        break
      case '/send-webmentions':
        await sendWebmentions(payload)
        break
    }
  } catch (error) {
    console.error(error)
  }

  res.status(200).send('OK')
}
