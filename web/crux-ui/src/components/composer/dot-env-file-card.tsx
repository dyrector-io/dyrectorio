import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoImgButton from '@app/elements/dyo-img-button'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import { DotEnvironment } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import ShEditor from '../shared/sh-editor-dynamic-module'

type DotEnvFileCardProps = {
  className?: string
  dotEnv: DotEnvironment
  onNameChange?: (name: string) => void
  onEnvChange: (text: string) => void
  onRemove?: VoidFunction
}

const DotEnvFileCard = (props: DotEnvFileCardProps) => {
  const { className, dotEnv, onEnvChange: onChange, onNameChange, onRemove } = props

  const initialValue: string = Object.entries(dotEnv?.environment ?? {})
    .map(entry => {
      const [key, val] = entry

      return `${key}=${val}`
    })
    .join('\n')

  const { t } = useTranslation('compose')

  return (
    <DyoCard className={clsx('flex flex-col gap-2 w-full', className ?? 'h-128 p-6')}>
      <div className="flex flex-row justify-between items-center gap-2">
        <DyoHeading element="h4" className="text-lg text-bright whitespace-nowrap">
          {t('dotEnvFile')}
        </DyoHeading>

        <DyoInput
          containerClassName="mb-1"
          labelClassName="mr-2 my-auto"
          disabled={!onNameChange}
          grow
          inline
          label={t('common:name')}
          value={dotEnv.name}
          onChange={onNameChange ? ev => onNameChange(ev.target.value) : null}
        />

        {onRemove && <DyoImgButton onClick={onRemove} src="/trash-can.svg" alt={t('common:delete')} />}
      </div>

      {dotEnv.errorMessage ? (
        <DyoMessage message={dotEnv.errorMessage} className="text-xs italic w-full" messageType="error" />
      ) : null}

      <ShEditor className="h-full overflow-y-scroll" initialValue={initialValue} onChange={onChange} />
    </DyoCard>
  )
}

export default DotEnvFileCard
