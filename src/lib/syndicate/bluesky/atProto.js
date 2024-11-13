import { AtpAgent } from '@atproto/api'

async function main() {
  const agent = new AtpAgent({
    service: 'https://bsky.social',
  })

  await agent.login({
    identifier: 'stephensauceda.com',
    password: process.env.BLUESKY_APP_PASSWORD,
  })

  return agent
}

export const agent = main()
