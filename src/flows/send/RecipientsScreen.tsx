import { Spinner } from '../../components/Loader'
import { useEffect, useState } from 'react'
import { Screen } from '../../components/Screen'
import { CapsHeader, ListRow } from '../../components/ListRow'
import { SearchHeader } from '../../components/SearchHeader'
import { Avatar, colorFor, initialsOf } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Icon } from '../../components/icons'
import { useBack } from '../../app/back'
import { useDemo, displayName } from '../../app/store'
import { simulateInline } from '../../engine/delay'
import { t } from '../../mock/texts'
import { MO_SIMBA, SEED_RECENT, type SendRecipient } from '../../mock/recipients'
import { searchRecipients, type SearchResult } from './search'
import { maskAccount } from '../shared'

export const SEND_GRADIENT = 'var(--gradient-flow-header-blue)'

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

  // Rows as in Figma 124:11212 / 12:4246: Mo-Simba recipients carry a "Simba" badge; TIPS rows show bank and account.
  const row = (r: SendRecipient, withPhone = false) => {
    const name = displayName(r, saved)
    const internal = r.kind === 'internal'
    return (
      <ListRow
        key={r.account}
        testId="recipient-row"
        leading={<Avatar initials={initialsOf(name)} color={colorFor(name)} />}
        title={name}
        subtitle={internal ? (withPhone ? r.phone : undefined) : `${r.bank} ${maskAccount(r.account)}`}
        below={internal ? <Badge>{SIMBA_BADGE}</Badge> : undefined}
        onClick={() => onPick(r)}
      />
    )
  }

  return (
    <Screen
      testId="send-recipients"
      gradient={SEND_GRADIENT}
      header={
        <SearchHeader
          title={t('payments.send_money.title')}
          onBack={onBack}
          query={query}
          onQuery={setQuery}
          data-testid="send-search"
          placeholder={t('payments.send_money.search_hint')}
          inputMode="search"
        />
      }
    >
      {!query.trim() ? (
        <>
          <ListRow
            testId="send-other-bank"
            icon="bank"
            right={<Icon name="chevronRight" size={16} color="var(--color-icon-30)" />}
            title={t('payments.send_money.other_bank_title')}
            subtitle={t('payments.send_money.other_bank_subtitle')}
            onClick={onOtherBank}
          />
          <div className="h-6" />
          <CapsHeader>{t('payments.send_money.recent')}</CapsHeader>
          {/* Address-book recipients show name and badge; a recipient found by number and not saved also shows the phone (Figma 12:6295). */}
          <div data-testid="send-recent">{recent.map((r) => row(r, !(r.account in saved) && !SEED_RECENT.some((x) => x.account === r.account)))}</div>
        </>
      ) : loading ? (
        <div className="flex justify-center py-10" data-testid="search-loader">
          <Spinner size={28} />
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
              {result.contacts.map((r) => row(r, true))}
            </>
          )}
        </div>
      )}
    </Screen>
  )
}

/** Badge label for Mo-Simba accounts, as drawn in Figma ("Simba"). */
export const SIMBA_BADGE = 'Simba'

export const bankBadge = (bank: string) => <Badge>{bank === MO_SIMBA ? SIMBA_BADGE : bank}</Badge>
