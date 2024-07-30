import { syndicate } from './lib/syndicate.js'

export const ghostSyndicate = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  const { post } = req.body

  try {
    await syndicate(post)
  } catch (error) {
    console.error(error)
  }

  res.status(200).send('OK')
}
