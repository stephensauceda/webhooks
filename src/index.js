import { syndicate } from './lib/syndicate/index.js'
import { validateWebhook } from './lib/validateWebhook.js'

export const webhooks = async (req, res) => {
  const authorizedWebhook = validateWebhook(req)

  if (!authorizedWebhook) {
    res.status(401).send('Unauthorized')
    return
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  const { path } = req
  const { post } = req.body

  try {
    switch (path) {
      case '/syndicate':
        await syndicate(post)
        break
    }
  } catch (error) {
    console.error(error)
  }

  res.status(200).send('OK')
}
