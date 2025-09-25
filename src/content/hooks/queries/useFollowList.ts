import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { IFollowingItem } from '@/types/follow'

import { queryKeys } from '@/constants/querykeys'
import { sendRuntimeMessage } from '@/utils/helper'

export default function useFollowList() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.bookmark.followList(),
    queryFn: async () =>
      await sendRuntimeMessage<IFollowingItem[]>('fetchFollowList'),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.followList() })
  }

  return { ...query, invalidate }
}
