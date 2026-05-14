import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      aria-label="Toggle theme"
      className="relative inline-flex items-center w-14 h-7 rounded-full border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/[0.04] transition-colors"
    >
      <span
        className={
          'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 dark:from-zinc-300 dark:to-zinc-100 shadow-md flex items-center justify-center text-[11px] transition-transform duration-200 ' +
          (isDark ? 'translate-x-7' : 'translate-x-0')
        }
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
