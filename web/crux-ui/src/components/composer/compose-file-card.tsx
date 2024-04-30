import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoMessage from '@app/elements/dyo-message'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import YamlEditor from '../shared/yaml-editor'

type ComposeFileCardProps = {
  className?: string
  errorMessage?: string
  onChange: (text: string) => void
}

const ComposeFileCard = (props: ComposeFileCardProps) => {
  const { className, errorMessage, onChange } = props

  const { t } = useTranslation('compose')

  return (
    <DyoCard className={clsx('flex flex-col h-128 w-full', className ?? 'p-6')}>
      <DyoHeading element="h4" className="text-lg text-bright mb-2">
        {t('composeFile')}
      </DyoHeading>

      {errorMessage ? (
        <DyoMessage message={errorMessage} className="text-xs italic w-full" messageType="error" />
      ) : null}

      <YamlEditor className="h-full overflow-y-scroll" onChange={onChange} />
    </DyoCard>
  )
}

export default ComposeFileCard
