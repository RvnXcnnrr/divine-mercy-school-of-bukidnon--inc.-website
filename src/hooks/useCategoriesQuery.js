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
