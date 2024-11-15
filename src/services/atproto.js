import { AtpAgent as Agent, RichText } from '@atproto/api'

const AtpAgent = new Agent({
  service: 'https://bsky.social'
})

await AtpAgent.login({
  identifier: 'stephensauceda.com',
  password: process.env.BLUESKY_APP_PASSWORD
})

export default { AtpAgent, RichText }
