import { useQuery } from '@tanstack/react-query'

import type { ILiveContent } from '@/types/follow'

import { queryKeys } from '@/constants/querykeys'
import { sendRuntimeMessage } from '@/utils/helper'

export default function useStreamerLiveStatus(hashId: string) {
  return useQuery({
    queryKey: queryKeys.bookmark.liveStatus(hashId),
    queryFn: async () =>
      await sendRuntimeMessage<ILiveContent>('fetchStreamerLiveStatus', hashId),
  })
}
