import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { ServiceStatus } from '@app/models'
import clsx from 'clsx'
import ServiceStatusIndicator from './service-status-indicator'
import ServiceStatusTag from './service-status-tag'

interface ServiceStatusCardProps {
  className?: string
  name: string
  status: ServiceStatus
}

const ServiceStatusCard = (props: ServiceStatusCardProps) => {
  const { status } = props

  return (
    <DyoCard className={clsx(props.className, 'flex flex-col p-8 m-4')}>
      <div className="flex flex-row flex-grow">
        <DyoHeading element="h3" className="text-xl text-white">
          {props.name}
        </DyoHeading>

        <ServiceStatusIndicator className="ml-auto pl-8 py-auto" status={status} />
      </div>

      <div className="flex flex-row justify-center mt-12">
        <ServiceStatusTag status={status} />
      </div>
    </DyoCard>
  )
}

export default ServiceStatusCard
