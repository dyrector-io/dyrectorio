import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoLabel } from '@app/elements/dyo-label'
import { Storage } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'

interface StorageCardProps extends Omit<DyoCardProps, 'children'> {
  storage: Storage
  titleHref?: string
}

const StorageCard = (props: StorageCardProps) => {
  const { storage, titleHref, className } = props

  const { t } = useTranslation('storages')

  const title = (
    <div className="flex flex-row">
      {!storage.icon ? (
        <DyoIcon src="/default_storage.svg" size="md" alt={t('altDefaultStoragePicture')} />
      ) : (
        <DyoBadge large icon={storage.icon} />
      )}

      <DyoHeading className="text-xl text-bright font-semibold ml-2 my-auto mr-auto" element="h3">
        {storage.name}
      </DyoHeading>
    </div>
  )

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      {titleHref ? <Link href={titleHref}>{title}</Link> : title}

      <div className="my-4 text-ellipsis overflow-hidden whitespace-nowrap text-light-eased">
        <DyoLabel className="mr-auto">{storage.url}</DyoLabel>
      </div>

      <DyoExpandableText
        text={storage.description}
        lineClamp={2}
        className="text-md text-light mt-2 max-h-44"
        buttonClassName="ml-auto"
        modalTitle={storage.name}
      />
    </DyoCard>
  )
}

export default StorageCard
