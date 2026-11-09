import { useEffect } from 'react'
import { Icon } from './icons'

interface Props {
  onDigit: (d: string) => void
  onDelete: () => void
  /** Also accept a physical keyboard (desktop rehearsal). */
  keyboard?: boolean
}

/** In-app numeric keypad styled like the iOS number pad in Figma ("Keyboard / Numbers and Punctuation"). */
export function Keypad({ onDigit, onDelete, keyboard = true }: Props) {
  useEffect(() => {
    if (!keyboard) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (/^\d$/.test(e.key)) onDigit(e.key)
      else if (e.key === 'Backspace') onDelete()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keyboard, onDigit, onDelete])

  const key = (d: string) => (
    <button
      key={d}
      type="button"
      aria-label={d}
      data-testid={`key-${d}`}
      onClick={() => onDigit(d)}
      className="h-[50px] flex-1 rounded-[8.5px] bg-white text-[23px] leading-[28px] shadow-[0_1px_0_rgba(0,0,0,0.12)] active:bg-black/10"
    >
      {d}
    </button>
  )
  return (
    <div
      className="flex shrink-0 flex-col gap-[6px] rounded-t-[27px] bg-keyboard px-[7.5px] pt-6"
      style={{ paddingBottom: 'calc(var(--safe-bottom) + 42px)' }}
    >
      {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row) => (
        <div key={row[0]} className="flex gap-[6px]">
          {row.map(key)}
        </div>
      ))}
      <div className="flex gap-[6px]">
        <span className="h-[50px] flex-1" />
        {key('0')}
        <button
          type="button"
          aria-label="Delete"
          data-testid="key-del"
          onClick={onDelete}
          className="grid h-[50px] flex-1 place-items-center rounded-[8.5px] text-keyboard-glyph active:bg-black/10"
        >
          <Icon name="backspace" size={26} />
        </button>
      </div>
    </div>
  )
}
