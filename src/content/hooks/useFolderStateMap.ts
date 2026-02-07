import { useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/constants/querykeys'
import { getFolderStateMap } from '@/stores/folderStateStore'

export default function useFolderStateMap() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.folderState.map(),
    queryFn: getFolderStateMap,
    staleTime: Infinity,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.folderState.map(),
    })
  }

  return { ...query, invalidate }
}
