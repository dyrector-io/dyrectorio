import DyoIcon from '@app/elements/dyo-icon'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import clsx from 'clsx'

type ConfigSectionLabelProps = {
  disabled: boolean
  className?: string
  labelClassName?: string
  children: React.ReactNode
  onResetSection: VoidFunction
  error?: string
}

const ConfigSectionLabel = (props: ConfigSectionLabelProps) => {
  const { disabled, className, labelClassName, children, onResetSection, error } = props

  return (
    <div className={clsx('flex flex-col', className)}>
      <div className="flex flex-row">
        <DyoLabel className={labelClassName ?? 'text-bright font-semibold tracking-wide mb-2'}>{children}</DyoLabel>

        {!disabled && (
          <DyoIcon
            className="w-6 h-6 cursor-pointer ml-2"
            src="/refresh.svg"
            size="md"
            alt="reset"
            onClick={onResetSection}
          />
        )}
      </div>

      {error && <DyoMessage grow message={error} messageType="error" />}
    </div>
  )
}

export default ConfigSectionLabel
