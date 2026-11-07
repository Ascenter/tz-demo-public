import { LargeTitle } from '../components/NavBar'
import { useDemo } from '../app/store'
import { formatNumber } from '../engine/format'
import { t, type TextKey } from '../mock/texts'
import { Illustration } from '../components/Illustration'

/** Credit, Savings, More: static pages in the same style; not part of this demo. */
export function Placeholder({ kind }: { kind: 'credit' | 'savings' | 'more' }) {
  const limit = useDemo((s) => s.ledger.creditLimit)
  const gradient = { credit: 'var(--gradient-transfer)', savings: 'var(--gradient-fund)', more: 'var(--gradient-home)' }[kind]
  return (
    <div className="scroll-y absolute inset-0" data-testid={`placeholder-${kind}`}>
      <div className="relative min-h-full">
        <div className="absolute inset-x-0 top-0 h-[260px]" style={{ background: gradient }} />
        <div className="relative" style={{ paddingTop: 'calc(var(--safe-top) + 52px)' }}>
          <LargeTitle title={t(`placeholder.${kind}_title` as TextKey)} />
        </div>
        <div className="relative flex min-h-[720px] flex-col items-center gap-4 rounded-t-container bg-surface px-10 pb-32 pt-16 text-center">
          <Illustration kind="pending" size={120} />
          <p className="font-display text-header font-semibold">{t('placeholder.soon')}</p>
          <p className="text-body-m text-secondary">
            {t(`placeholder.${kind}_body` as TextKey, { limit: formatNumber(limit) })}
          </p>
        </div>
      </div>
    </div>
  )
}
