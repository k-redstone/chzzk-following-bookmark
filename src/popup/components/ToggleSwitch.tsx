interface ToggleSwitchProps {
  checked: boolean
  onChange: () => void
  label?: string
  disabled?: boolean
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      className={`flex cursor-pointer items-center justify-between gap-2 select-none focus:outline-none ${disabled ? 'cursor-not-allowed opacity-60' : ''} `}
      onClick={() => !disabled && onChange()}
      disabled={disabled}
    >
      {label && <span className="text-sm">{label}</span>}
      <span
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-300 ${checked ? 'bg-bg-chzzk-03' : 'bg-gray-300'} `}
      >
        <span
          className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${checked ? 'translate-x-5' : ''} `}
          style={{ willChange: 'transform' }}
        />
      </span>
    </button>
  )
}
