import { useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/constants/querykeys'
import { getBookmarkState } from '@/stores/bookmarkStore'

export default function useBookmarkState() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.bookmark.state(),
    queryFn: getBookmarkState,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bookmarkState'] })
  }

  return { ...query, invalidate }
}
