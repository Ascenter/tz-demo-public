import { useEffect, useState } from 'react'
import { Screen } from '../../components/Screen'
import { LargeTitle, NavBar } from '../../components/NavBar'
import { CapsHeader, ListRow } from '../../components/ListRow'
import { SearchField } from '../../components/Fields'
import { Avatar, colorFor, initialsOf } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { useBack } from '../../app/back'
import { useDemo, displayName } from '../../app/store'
import { simulateInline } from '../../engine/delay'
import { t } from '../../mock/texts'
import { MO_SIMBA, type SendRecipient } from '../../mock/recipients'
import { searchRecipients, type SearchResult } from './search'
import { maskAccount } from '../shared'

export const SEND_GRADIENT = 'var(--gradient-transfer)'

interface Props {
  onBack: () => void
  onPick: (r: SendRecipient) => void
  onOtherBank: () => void
}

/** Send money start: search, "Transfer to another bank", Recent (Send BR-08). */
export function RecipientsScreen({ onBack, onPick, onOtherBank }: Props) {
  useBack(onBack)
  const recent = useDemo((s) => s.recent)
  const saved = useDemo((s) => s.saved)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Send BR-10: search shows a loader of at least 200 ms (inline, so typing is not blocked).
  useEffect(() => {
    if (!query.trim()) {
      setResult(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(async () => {
      const r = await simulateInline(() => searchRecipients(query, recent, saved))
      if (!cancelled) {
        setResult(r)
        setLoading(false)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, recent, saved])

  const row = (r: SendRecipient, isNew = false) => {
    const name = displayName(r, saved)
    return (
      <ListRow
        key={r.account}
        testId="recipient-row"
        leading={<Avatar initials={initialsOf(name)} color={colorFor(name)} />}
        title={name}
        subtitle={
          isNew ? (
            <span className="flex items-center gap-2">
              {r.phone} <Badge>Simba</Badge>
            </span>
          ) : r.kind === 'tips' ? (
            `${maskAccount(r.account)} · ${r.bank}`
          ) : (
            r.phone ?? r.bank
          )
        }
        onClick={() => onPick(r)}
      />
    )
  }

  return (
    <Screen
      testId="send-recipients"
      gradient={SEND_GRADIENT}
      header={
        <>
          <NavBar onBack={onBack} />
          <LargeTitle title={t('payments.send_money.title')} />
          <div className="pb-6">
            <SearchField
              data-testid="send-search"
              placeholder={t('payments.send_money.search_hint')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              inputMode="search"
              autoComplete="off"
            />
          </div>
        </>
      }
    >
      {!query.trim() ? (
        <>
          <ListRow
            testId="send-other-bank"
            icon="bank"
            avatarColor="#000"
            title={t('payments.send_money.other_bank_title')}
            subtitle={t('payments.send_money.other_bank_subtitle')}
            onClick={onOtherBank}
          />
          <div className="h-6" />
          <CapsHeader>{t('payments.send_money.recent')}</CapsHeader>
          <div data-testid="send-recent">{recent.map((r) => row(r))}</div>
        </>
      ) : loading ? (
        <div className="flex justify-center py-10" data-testid="search-loader">
          <span className="size-7 rounded-full border-[3px] border-black/10 border-t-black" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div data-testid="search-results">
          {result?.newRecipient && (
            <>
              <CapsHeader>{t('payments.send_money.new_recipient')}</CapsHeader>
              {row(result.newRecipient, true)}
            </>
          )}
          {result && result.contacts.length > 0 && (
            <>
              <CapsHeader>{t('payments.send_money.results')}</CapsHeader>
              {result.contacts.map((r) => row(r))}
            </>
          )}
        </div>
      )}
    </Screen>
  )
}

export const bankBadge = (bank: string) => <Badge>{bank === MO_SIMBA ? 'Mo-Simba' : bank}</Badge>
