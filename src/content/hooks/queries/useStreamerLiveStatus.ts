import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { ILiveContent } from '@/types/follow'

import { queryKeys } from '@/constants/querykeys'
import { sendRuntimeMessage } from '@/utils/helper'

export default function useStreamerLiveStatus(hashId?: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.bookmark.liveStatus(hashId ?? ''),
    queryFn: async () =>
      await sendRuntimeMessage<ILiveContent>('fetchStreamerLiveStatus', hashId),
    enabled: !!hashId,
  })

  const invalidate = () => {
    if (!hashId) return
    queryClient.invalidateQueries({
      queryKey: queryKeys.bookmark.liveStatus(hashId),
    })
  }

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.bookmark.liveStatusKey,
    })
  }

  return { ...query, invalidate, invalidateAll }
}
