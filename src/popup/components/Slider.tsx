import { useCallback, useEffect, useId, useRef } from 'react'

import useControllableState from '@/popup/hooks/useControllableState'

const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v))

const roundToStep = (v: number, step: number, min: number): number => {
  const inv = 1 / step
  return Math.round((v - min) * inv) / inv + min
}

const valueToPercent = (value: number, min: number, max: number): number => {
  if (max === min) return 0
  return ((value - min) * 100) / (max - min)
}

export interface SliderProps {
  min: number
  max: number
  step?: number // 기본 1
  value?: number // controlled
  defaultValue?: number // uncontrolled
  onChange?: (value: number) => void
  disabled?: boolean
  ariaLabel?: string
  unit?: string
}

export default function Slider({
  min,
  max,
  step = 1,
  value,
  defaultValue,
  onChange,
  disabled = false,
  ariaLabel,
  unit,
}: SliderProps) {
  if (max <= min) throw new Error('`max` must be greater than `min`.')
  if (step <= 0) throw new Error('`step` must be > 0.')

  const [val, setVal] = useControllableState(
    value,
    defaultValue ?? min,
    onChange,
  )
  const clampedVal = clamp(roundToStep(val, step, min), min, max)
  const percent = valueToPercent(clampedVal, min, max)

  useEffect(() => {
    const fixed = clamp(roundToStep(val, step, min), min, max)
    if (fixed !== val) setVal(fixed)
  }, [min, max, step, val, setVal])

  const id = useId()
  const trackRef = useRef<HTMLDivElement | null>(null)

  const getValueFromPointer = useCallback(
    (clientX: number): number => {
      const track = trackRef.current
      if (!track) return clampedVal
      const rect = track.getBoundingClientRect()
      const x = clamp(clientX, rect.left, rect.right) - rect.left
      const ratio = rect.width === 0 ? 0 : x / rect.width
      const raw = min + ratio * (max - min)
      return clamp(roundToStep(raw, step, min), min, max)
    },
    [clampedVal, max, min, step],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
      setVal(getValueFromPointer(e.clientX))
    },
    [disabled, getValueFromPointer, setVal],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      const target = e.currentTarget as HTMLDivElement
      if (!target.hasPointerCapture(e.pointerId)) return
      setVal(getValueFromPointer(e.clientX))
    },
    [disabled, getValueFromPointer, setVal],
  )

  return (
    <div className="flex items-center gap-x-4">
      <span className="flex-shrink-0 text-sm">{ariaLabel}</span>
      <div
        className={`w-full cursor-pointer select-none`}
        aria-disabled={disabled}
      >
        <div className="flex items-center gap-3">
          {/* Track */}
          <div
            ref={trackRef}
            className={'relative h-2 w-full rounded-full bg-gray-200'}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            role="presentation"
          >
            {/* Range */}
            <div
              className={
                'bg-bg-chzzk-03 absolute top-0 left-0 h-full rounded-full'
              }
              style={{ width: `${percent}%` }}
            />

            {/* Thumb */}
            <div
              id={`thumb-${id}`}
              role="slider"
              aria-label={ariaLabel}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={Math.round(clampedVal / step) * step}
              tabIndex={disabled ? -1 : 0}
              className={
                'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow ring-1 ring-gray-300 focus-visible:ring-blue-500 focus-visible:outline-none *:focus-visible:ring-2'
              }
              style={{ left: `${percent}%` }}
            />
          </div>
        </div>
      </div>
      <span className="mr-6 w-5 flex-shrink-0 text-sm">
        {val}
        {unit}
      </span>
    </div>
  )
}
