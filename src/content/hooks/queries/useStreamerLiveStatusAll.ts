import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { ILiveContent } from '@/types/follow'

export interface ILiveStatusMap {
  [id: string]: ILiveContent
}

export interface UseLiveStatusAllOptions {
  intervalMs?: number
  concurrency?: number
  chunkSize?: number
}

export interface UseLiveStatusAllResult {
  liveMap: ILiveStatusMap | null
  failedIds: string[]
  fetchedAt: number
  isLoading: boolean
  isFetching: boolean
  refetch: () => Promise<unknown>
}

async function fetchBatchFromBg(ids: string[], concurrency = 8) {
  const resp = (await chrome.runtime.sendMessage({
    type: 'fetchStreamerLiveStatusBatch',
    args: [ids, concurrency],
  })) as { ok: boolean; items?: ILiveContent[]; failedIds?: string[] }

  return {
    items: resp?.items ?? [],
    failedIds: resp?.failedIds ?? [],
  }
}

export function useStreamerLiveStatusAll(
  allUniqueIdsForFetch: string[],
  opts?: UseLiveStatusAllOptions,
): UseLiveStatusAllResult {
  const intervalMs = opts?.intervalMs ?? 60_000
  const concurrency = opts?.concurrency ?? 8

  const key = useMemo(
    () => ['livestatus', 'all', { ids: [...allUniqueIdsForFetch].sort() }],
    [allUniqueIdsForFetch],
  )

  const query = useQuery({
    queryKey: key,
    enabled: allUniqueIdsForFetch.length > 0,
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
    gcTime: 5 * 60_000,
    queryFn: async () => {
      const now = Date.now()
      if (!allUniqueIdsForFetch.length) {
        return {
          liveMap: {} as ILiveStatusMap,
          failedIds: [] as string[],
          fetchedAt: now,
        }
      }
      const { items, failedIds } = await fetchBatchFromBg(
        allUniqueIdsForFetch,
        concurrency,
      )
      const liveMap: ILiveStatusMap = Object.fromEntries(
        items.map((item) => [item.channelId, item] as const),
      )
      return { liveMap, failedIds, fetchedAt: now }
    },
    select: (raw) => raw,
  })

  return {
    liveMap: query.data?.liveMap ?? null,
    failedIds: query.data?.failedIds ?? [],
    fetchedAt: query.data?.fetchedAt ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  }
}
