import DyoIcon from '@app/elements/dyo-icon'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

type OnboardEntryLine = 'top' | 'bottom' | 'vertical'

type OnboardEntryProps = {
  onboardKey: string
  done: boolean
  step: number
  nextStep: boolean
  line: OnboardEntryLine
  href?: string
}

const OnboardingEntry = (props: OnboardEntryProps) => {
  const { t } = useTranslation('dashboard')

  const { onboardKey, done, step, nextStep, line, href } = props

  const lineClassName = clsx('w-0.5 h-full mx-auto', done ? 'bg-dyo-turquoise' : 'bg-bright')

  return (
    <div className="flex flex-row">
      <div className="flex flex-col mr-4">
        <div className={clsx(lineClassName, line === 'bottom' ? 'invisible' : null)} />

        {done ? (
          <div className="w-7 h-7">
            <DyoIcon
              src="/check-white.svg"
              className="flex rounded-full bg-dyo-turquoise p-0.5"
              size="md"
              alt={t('done')}
            />
          </div>
        ) : (
          <div className="flex rounded-full border border-2 border-bright w-7 h-7">
            <span className="text-white m-auto">{step}</span>
          </div>
        )}

        <div className={clsx(lineClassName, line === 'top' ? 'invisible' : null)} />
      </div>

      <div className="flex flex-col m-4">
        <a className={nextStep ? 'text-dyo-turquoise' : 'text-bright'} href={href}>
          {t(`onboardingItems.${onboardKey}.title`)}
        </a>

        <span className="text-bright-muted">{t(`onboardingItems.${onboardKey}.description`)}</span>
      </div>
    </div>
  )
}

export default OnboardingEntry
