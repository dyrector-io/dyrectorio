import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoModal from '@app/elements/dyo-modal'
import DyoTag from '@app/elements/dyo-tag'
import { useOverflowDetection } from '@app/hooks/use-overflow-detection'
import { Version } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface VersionDetailsCardProps {
  className?: string
  version: Version
}

const VersionDetailsCard = (props: VersionDetailsCardProps) => {
  const { t } = useTranslation('versions')

  const { version } = props

  const [showAll, setShowAll] = useState(false)
  const [overflow, overflowRef] = useOverflowDetection<HTMLParagraphElement>()

  return (
    <DyoCard className={clsx(props.className ?? 'p-6', 'flex flex-col')}>
      <DyoHeading element="h2" className="text-xl font-bold text-bright">
        {version.name}
      </DyoHeading>

      <div className="flex flex-row">
        <div className="flex flex-col">
          <p ref={overflowRef} className="text-light line-clamp-6 mt-1">
            {version.changelog}
          </p>

          {!overflow ? null : (
            <DyoButton className="ml-auto my-2" text onClick={() => setShowAll(true)}>
              {t('showAll')}
            </DyoButton>
          )}
        </div>

        <div className="flex flex-col flex-grow">
          <span className="self-end text-bright whitespace-nowrap ml-2 mb-2">{utcDateToLocale(version.updatedAt)}</span>

          <div className="flex flex-row ml-auto mt-auto">
            {!version.default ? null : (
              <DyoTag color="bg-error-red" textColor="text-error-red">
                {t('default').toUpperCase()}
              </DyoTag>
            )}
            <DyoTag className="ml-8">{t(version.type).toUpperCase()}</DyoTag>
          </div>
        </div>
      </div>

      {!showAll ? null : (
        <DyoModal
          className="w-1/2 h-1/2"
          title={t('changelogName', { name: version.name })}
          open={showAll}
          onClose={() => setShowAll(false)}
        >
          <p className="text-bright mt-8 overflow-y-auto">{version.changelog}</p>
        </DyoModal>
      )}
    </DyoCard>
  )
}

export default VersionDetailsCard
