import { useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/constants/querykeys'
import { getSettingState } from '@/stores/settingStore'

export default function useSettingState() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.setting.state(),
    queryFn: getSettingState,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.setting.state() })
  }

  return { ...query, invalidate }
}
