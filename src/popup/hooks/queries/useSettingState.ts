import { useQuery, useQueryClient } from '@tanstack/react-query'

import type { ISettingState } from '@/types/setting'

import { queryKeys } from '@/constants/querykeys'
import { getSettingState, settingSliderOnChange } from '@/stores/settingStore'

export default function useSettingState() {
  const queryClient = useQueryClient()
  const key = queryKeys.setting.state()

  const query = useQuery({
    queryKey: queryKeys.setting.state(),
    queryFn: getSettingState,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.setting.state() })
  }

  const setLocal = (partial: Partial<ISettingState>) => {
    queryClient.setQueryData<ISettingState>(key, (old) =>
      old ? { ...old, ...partial } : old,
    )
  }

  /** 슬라이더용 onChange (낙관적 업데이트 + 디바운스 저장) */
  const makeSliderOnChange = <K extends keyof ISettingState>(
    field: K,
    opts?: { debounceMs?: number },
  ) =>
    settingSliderOnChange(field, {
      debounceMs: opts?.debounceMs ?? 150,
      onLocal: (v: number) =>
        setLocal({ [field]: v } as Partial<ISettingState>),
    })

  return { ...query, invalidate, makeSliderOnChange, setLocal }
}
