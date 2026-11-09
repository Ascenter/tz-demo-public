import { useMemo, useState } from 'react'
import { useDemo } from '../app/store'
import { groupByDay, type Category, type Operation } from '../engine/money'
import { formatFeedAmount, formatNumber } from '../engine/format'
import { startOfDay, now, DAY_MS } from '../engine/clock'
import { CapsHeader, ListRow } from '../components/ListRow'
import { Icon, type IconName } from '../components/icons'
import { TransactionDetails } from '../components/TransactionDetails'
import { t } from '../mock/texts'

// Category icon and colour as in the Figma "Transaction_list_item" rows.
const CATEGORY: Record<Category, { icon: IconName; color?: string }> = {
  transfer: { icon: 'arrowRight' },
  topup: { icon: 'plus', color: 'var(--color-on-bg-primary)' },
  cash: { icon: 'wallet' },
  bills: { icon: 'flash' },
  water: { icon: 'drop' },
  gov: { icon: 'gov', color: 'var(--color-olive)' },
  card: { icon: 'apple' },
  qr: { icon: 'qr', color: 'var(--color-turquoise)' },
  airtime: { icon: 'phone' },
}

function dayHeader(day: number, sum: number): string {
  const today = startOfDay(now())
  const s = formatNumber(sum)
  if (day === today) return t('home.history_today', { sum: s })
  if (day === today - DAY_MS || Math.round((today - day) / DAY_MS) === 1) return t('home.history_yesterday', { sum: s })
  const label = new Date(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
  return t('home.history_day', { day: label, sum: s })
}

/** Home feed: grouped by day, newest first; header sum counts only money going out (parent BR-17). */
export function Feed() {
  const history = useDemo((s) => s.history)
  const groups = useMemo(() => groupByDay(history, now()), [history])
  const [openId, setOpenId] = useState<string | null>(null)
  const open = history.find((o) => o.id === openId) ?? null
  return (
    <div className="flex flex-col gap-6" data-testid="feed">
      <TransactionDetails op={open} onClose={() => setOpenId(null)} />
      {groups.map((g, i) => (
        <section key={g.day} data-testid={i === 0 ? 'feed-group-first' : undefined}>
          <CapsHeader
            testId={startOfDay(now()) === g.day ? 'today-header' : undefined}
            right={
              i === 0 ? (
                <span className="flex gap-5 text-icon-30">
                  <Icon name="diagram" />
                  <Icon name="search" />
                </span>
              ) : undefined
            }
          >
            {dayHeader(g.day, g.outSum)}
          </CapsHeader>
          {g.items.map((op) => (
            <FeedRow key={op.id} op={op} onOpen={op.details ? () => setOpenId(op.id) : undefined} />
          ))}
        </section>
      ))}
      {groups.length === 0 && <p className="px-5 py-10 text-center t-regular-14 text-on-bg-secondary">{t('home.history_empty')}</p>}
    </div>
  )
}

function FeedRow({ op, onOpen }: { op: Operation; onOpen?: () => void }) {
  const c = CATEGORY[op.category]
  return (
    <div data-testid="feed-row">
      <ListRow
        title={op.title}
        subtitle={op.subtitle}
        icon={op.initials ? undefined : c.icon}
        initials={op.initials}
        avatarColor={c.color}
        onClick={onOpen} // only entries with details open (Cash v5)
        right={
          <span data-testid="feed-amount" className="t-regular-18 whitespace-nowrap">
            {formatFeedAmount(op.amount, op.direction)}
          </span>
        }
      />
    </div>
  )
}
