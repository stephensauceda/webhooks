import { describe, it, expect, vi } from 'vitest'
import { syndicateToBluesky } from './index'
import { agent } from './atProto.js'
import { RichText } from '@atproto/api'

vi.mock('./atProto.js', () => ({
  agent: {
    post: vi.fn(),
  },
}))

vi.mock('@atproto/api', () => ({
  RichText: vi.fn().mockImplementation(({ text }) => ({
    detectFacets: vi.fn(),
    text,
    facets: 'test',
  })),
}))

describe('syndicateToBluesky', () => {
  it('should syndicate post to Bluesky', async () => {
    const post = {
      current: {
        url: 'https://example.com',
        custom_excerpt: 'Custom Excerpt',
        title: 'Post Title',
        slug: 'post-slug',
      },
    }

    agent.post.mockResolvedValueOnce()

    const result = await syndicateToBluesky(post)

    expect(RichText).toHaveBeenCalledWith({
      text: 'Custom Excerpt https://example.com',
    })

    expect(agent.post).toHaveBeenCalledWith({
      text: 'Custom Excerpt https://example.com',
      facets: 'test',
      langs: ['en-US'],
      createdAt: expect.any(String),
    })
    expect(result).toBe('Syndicated post-slug to Bluesky.')
  })

  it('should use title if custom_excerpt is not provided', async () => {
    const post = {
      current: {
        url: 'https://example.com',
        custom_excerpt: '',
        title: 'Post Title',
        slug: 'post-slug',
      },
    }

    agent.post.mockResolvedValueOnce()

    const result = await syndicateToBluesky(post)

    expect(RichText).toHaveBeenCalledWith({
      text: 'Post Title https://example.com',
    })
    expect(agent.post).toHaveBeenCalledWith({
      text: 'Post Title https://example.com',
      facets: 'test',
      langs: ['en-US'],
      createdAt: expect.any(String),
    })
    expect(result).toBe('Syndicated post-slug to Bluesky.')
  })

  it('should handle errors gracefully', async () => {
    const post = {
      current: {
        url: 'https://example.com',
        custom_excerpt: 'Custom Excerpt',
        title: 'Post Title',
        slug: 'post-slug',
      },
    }

    agent.post.mockRejectedValueOnce(new Error('Failed to syndicate'))

    await expect(syndicateToBluesky(post)).rejects.toThrow(
      'Failed to syndicate'
    )
  })
})
