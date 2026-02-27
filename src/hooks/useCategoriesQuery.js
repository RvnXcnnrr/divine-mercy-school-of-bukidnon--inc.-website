/**
 * useCategoriesQuery — React Query wrapper for fetchCategories().
 * Returns cached category list; refetches when stale.
 * Usage: const { data } = useCategoriesQuery()
 */
import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '../services/categoryService.js'

export function useCategoriesQuery(options = {}) {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    select: (res) => res.data || [],
    ...options,
  })
}
