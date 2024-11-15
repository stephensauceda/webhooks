/* v8 ignore start */
import { AtpAgent as Agent, RichText as RT } from '@atproto/api'

const agent = new Agent({
  service: 'https://bsky.social'
})

await agent.login({
  identifier: 'stephensauceda.com',
  password: process.env.BLUESKY_APP_PASSWORD
})

export const AtpAgent = agent
export const RichText = RT
/* v8 ignore end */
