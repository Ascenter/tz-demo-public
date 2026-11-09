import type { InputHTMLAttributes, ReactNode } from 'react'

/**
 * Number entry like an amount (Figma 239:4506 GePG control number, 234:792 LUKU meter): centred caps label,
 * the number in Display 32/40 without a field box, then a centred hint or red line.
 */
export function CodeEntry({ label, children, ...input }: InputHTMLAttributes<HTMLInputElement> & { label: string; children?: ReactNode }) {
  return (
    <>
      <p className="pt-[10px] text-center t-semibold-12 text-sticky-header uppercase">{label}</p>
      <div className="flex flex-col items-center gap-3 px-5 pt-[10px]">
        <input
          {...input}
          className="h-10 w-full bg-transparent text-center t-display-32 text-on-bg-primary caret-on-bg-primary outline-none placeholder:text-on-bg-disabled"
        />
        {children}
      </div>
    </>
  )
}
