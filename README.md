# Webhooks

A cloud function that handles webhooks for various actions from my personal site (and potentially other things).

![tests](https://github.com/stephensauceda/webhooks/actions/workflows/tests.yml/badge.svg) [![codecov](https://codecov.io/github/stephensauceda/webhooks/graph/badge.svg?token=QZ8FFPHXLZ)](https://codecov.io/github/stephensauceda/webhooks)

### Routes
* `/syndicate` - POSSEs content from my website to other services
* `/send-webmentions` - sends webmentions via `webmentions.app`
* `/purge` - Purges cached pages via Cloudflare's API
