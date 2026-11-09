import type { ReactNode } from 'react'
import { Screen } from './Screen'
import { NavBar } from './NavBar'
import { ButtonBar, PrimaryButton } from './PrimaryButton'
import { Illustration, type IllustrationKind } from './Illustration'
import { useBack } from '../app/back'

interface Props {
  kind: IllustrationKind
  title: ReactNode
  body?: ReactNode
  /** Big content under the illustration, e.g. the withdrawal code. */
  extra?: ReactNode
  primary: { label: string; onClick: () => void }
  secondary?: { label: string; onClick: () => void }
  /** Back gesture; null = back does nothing on this screen. Defaults to the primary action. */
  onBack?: (() => void) | null
  testId?: string
}

/** Full-screen result (Figma "empty screen component" pattern: illustration, title, text, buttons). */
export function ResultScreen({ kind, title, body, extra, primary, secondary, onBack, testId }: Props) {
  useBack(onBack === undefined ? primary.onClick : onBack)
  return (
    <Screen
      testId={testId}
      header={<NavBar />}
      scroll={false}
      footer={
        <ButtonBar>
          {secondary && (
            <PrimaryButton variant="nobg" data-testid="result-secondary" onClick={secondary.onClick}>
              {secondary.label}
            </PrimaryButton>
          )}
          <PrimaryButton data-testid="result-primary" onClick={primary.onClick}>
            {primary.label}
          </PrimaryButton>
        </ButtonBar>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10">
        <Illustration kind={kind} />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 data-testid="result-title" className="t-display-23">
            {title}
          </h1>
          {body && (
            <p data-testid="result-body" className="t-regular-14 text-on-bg-secondary">
              {body}
            </p>
          )}
        </div>
        {extra}
      </div>
    </Screen>
  )
}
