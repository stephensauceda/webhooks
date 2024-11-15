/* v8 ignore start */
import { AtpAgent as Agent, RichText as RT } from '@atproto/api'

async function init() {
  const AtpAgent = new Agent({
    service: 'https://bsky.social'
  })

  await AtpAgent.login({
    identifier: 'stephensauceda.com',
    password: process.env.BLUESKY_APP_PASSWORD
  })

  return AtpAgent
}

export const AtpAgent = init()
export const RichText = RT
/* v8 ignore end */
