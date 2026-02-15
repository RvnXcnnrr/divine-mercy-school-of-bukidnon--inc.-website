import { useQuery } from '@tanstack/react-query'
import { fetchPosts } from '../services/postService.js'

export function usePostsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => fetchPosts(params),
    select: (res) => ({ items: res.data, count: res.count }),
    ...options,
  })
}
