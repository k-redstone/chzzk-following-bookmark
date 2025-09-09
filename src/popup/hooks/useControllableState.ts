import { useCallback, useEffect, useState } from 'react'

export default function useControllableState(
  controlled: number | undefined,
  defaultValue: number | undefined,
  onChange?: (v: number) => void,
): [number, (v: number) => void] {
  const [internal, setInternal] = useState<number>(
    controlled ?? defaultValue ?? 0,
  )
  const isControlled = controlled !== undefined

  useEffect(() => {
    if (isControlled) setInternal(controlled as number)
  }, [controlled, isControlled])

  const setValue = useCallback(
    (next: number) => {
      if (!isControlled) setInternal(next)
      if (onChange) onChange(next)
    },
    [isControlled, onChange],
  )

  return [internal, setValue]
}
