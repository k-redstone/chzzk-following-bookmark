import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getBookmarkState } from '@/stores/bookmarkStore'

export default function useBookmarkState() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['bookmarkState'],
    queryFn: getBookmarkState,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bookmarkState'] })
  }

  return { ...query, invalidate }
}
