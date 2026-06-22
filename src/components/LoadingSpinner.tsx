'use client'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface LoadingSpinnerProps {
  size?: SpinnerSize
  text?: string
}

const SIZE_MAP: Record<SpinnerSize, { container: string; icon: string; text: string }> = {
  sm: { container: 'h-16', icon: 'text-xl', text: 'text-xs' },
  md: { container: 'h-24', icon: 'text-3xl', text: 'text-sm' },
  lg: { container: 'h-32', icon: 'text-4xl', text: 'text-base' },
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const s = SIZE_MAP[size]

  return (
    <div className={`flex flex-col items-center justify-center ${s.container}`}>
      <div className={`animate-spin ${s.icon}`}>☯</div>
      {text && (
        <p className={`text-gold-500 mt-2 font-medium ${s.text}`}>{text}</p>
      )}
    </div>
  )
}
