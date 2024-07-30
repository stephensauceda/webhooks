import { syndicate as s } from './lib/syndicate.js'

export const syndicate = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  const { post } = req.body

  try {
    await s(post)
  } catch (error) {
    console.error(error)
  }

  res.status(200).send('OK')
}
