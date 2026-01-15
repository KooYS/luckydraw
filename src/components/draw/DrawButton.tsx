'use client'

interface DrawButtonProps {
  onClick: () => void
  disabled?: boolean
  color: string
  label?: string
}

export default function DrawButton({
  onClick,
  disabled,
  color,
  label = '럭키드로우',
}: DrawButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl font-bold text-lg text-white transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: color }}
    >
      {label}
    </button>
  )
}
