import { useState, type InputHTMLAttributes } from 'react'
import { LargeTitle, NavBar } from './NavBar'
import { SearchField } from './Fields'
import { t } from '../mock/texts'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  title: string
  onBack: () => void
  query: string
  onQuery: (q: string) => void
}

/**
 * List header with a search field (Figma 124:11212 / 1:10181). Idle: large title, field below, sheet at 212 pt.
 * Focused or with text (live file, 18 Nov: 243:19984, 1:10231): centred title with no back arrow, the field 4 pt
 * under the toolbar, "Cancel" hugging its text 8 pt right of the field, sheet at 164 pt. Cancel leaves the search.
 */
export function SearchHeader({ title, onBack, query, onQuery, ...field }: Props) {
  const [focused, setFocused] = useState(false)
  const searching = focused || !!query.trim()
  const cancel = () => {
    onQuery('')
    setFocused(false)
    ;(document.activeElement as HTMLElement | null)?.blur()
  }
  return (
    <>
      <NavBar onBack={searching ? undefined : onBack} title={searching ? title : undefined} />
      {!searching && <LargeTitle title={title} tight />}
      <div className={`flex items-center gap-2 px-5 ${searching ? 'pb-8 pt-1' : 'pb-[34px]'}`}>
        <SearchField
          {...field}
          className="flex-1"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onClear={() => onQuery('')}
          autoComplete="off"
        />
        {searching && (
          <button type="button" data-testid="search-cancel" onClick={cancel} className="pressable shrink-0 text-right t-regular-16 text-on-bg-primary">
            {t('payments.common.cancel')}
          </button>
        )}
      </div>
    </>
  )
}
