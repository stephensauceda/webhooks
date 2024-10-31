import { syndicate } from './lib/syndicate/index.js'
import { validateWebhook } from './lib/validateWebhook.js'

export const ghostSyndicate = async (req, res) => {
  const authorizedWebhook = validateWebhook(req)

  if (!authorizedWebhook) {
    res.status(401).send('Unauthorized')
    return
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  const { post } = req.body

  try {
    await syndicate(post)
  } catch (error) {
    console.error(error)
  }

  res.status(200).send('OK')
}
