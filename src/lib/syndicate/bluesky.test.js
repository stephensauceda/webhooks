import { AtpAgent, RichText } from '../../services/atproto.js'
import { syndicateToBluesky } from './bluesky.js'

vi.mock('../../services/atproto.js', () => {
  const RichText = vi.fn()
  RichText.prototype.detectFacets = vi.fn()

  return {
    AtpAgent: {
      post: vi.fn(),
      login: vi.fn()
    },
    RichText
  }
})

vi.spyOn(console, 'log').mockReturnValue()

describe('bluesky', () => {
  test('syndicates post to Bluesky', async () => {
    const post = {
      current: {
        url: 'https://example.com',
        custom_excerpt: 'Custom Excerpt',
        title: 'Post Title',
        slug: 'post-slug'
      }
    }

    AtpAgent.post.mockResolvedValueOnce()

    await syndicateToBluesky(post)

    expect(RichText).toHaveBeenCalled()
    expect(AtpAgent.post).toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith(
      `Syndicated to Bluesky: ${post.current.slug}`
    )
  })

  test('uses title if custom_excerpt is not provided', async () => {
    const post = {
      current: {
        url: 'https://example.com',
        custom_excerpt: '',
        title: 'Post Title',
        slug: 'post-slug'
      }
    }

    const text = `${post.current.title} ${post.current.url}`

    RichText.prototype.text = text
    RichText.prototype.facets = []

    AtpAgent.post.mockResolvedValueOnce()

    await syndicateToBluesky(post)

    expect(RichText).toHaveBeenCalled()
    expect(AtpAgent.post).toHaveBeenCalledWith({
      text: text,
      facets: expect.any(Array),
      langs: ['en-US'],
      createdAt: expect.any(String)
    })
    expect(console.log).toHaveBeenCalledWith(
      `Syndicated to Bluesky: ${post.current.slug}`
    )
  })

  test('handles errors gracefully', async () => {
    const post = {
      current: {
        url: 'https://example.com',
        custom_excerpt: 'Custom Excerpt',
        title: 'Post Title',
        slug: 'post-slug'
      }
    }

    AtpAgent.post.mockRejectedValueOnce(new Error('Failed to syndicate'))

    await expect(syndicateToBluesky(post)).rejects.toThrow(
      'Failed to syndicate'
    )
  })
})
