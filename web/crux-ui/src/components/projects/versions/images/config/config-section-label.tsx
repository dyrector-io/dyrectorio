import { DyoLabel } from '@app/elements/dyo-label'
import clsx from 'clsx'
import Image from 'next/image'

type ConfigSectionLabelProps = {
  disabled: boolean
  className?: string
  labelClassName?: string
  children: React.ReactNode
  onResetSection: VoidFunction
}

const ConfigSectionLabel = (props: ConfigSectionLabelProps) => {
  const { disabled, className, labelClassName, children, onResetSection } = props

  return (
    <div className={clsx('flex flex-row', className)}>
      <DyoLabel className={labelClassName ?? 'text-bright font-semibold tracking-wide mb-2'}>{children}</DyoLabel>

      {disabled ? null : (
        <Image
          className="w-6 h-6 cursor-pointer ml-2"
          src="/refresh.svg"
          width={24}
          height={24}
          alt="reset"
          onClick={onResetSection}
        />
      )}
    </div>
  )
}

export default ConfigSectionLabel
