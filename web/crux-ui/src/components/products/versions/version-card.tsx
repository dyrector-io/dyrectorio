import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoModal from '@app/elements/dyo-modal'
import DyoTag from '@app/elements/dyo-tag'
import { useOverflowDetection } from '@app/hooks/use-overflow-detection'
import { Version } from '@app/models'
import { versionUrl } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

interface VersionCardProps {
  className?: string
  productId: string
  version: Version
  onClick?: () => void
  onIncreaseClick: () => void
}

const VersionCard = (props: VersionCardProps) => {
  const { t } = useTranslation('versions')

  const router = useRouter()

  const { className, productId, version, onClick } = props

  const [overflow, overflowRef] = useOverflowDetection<HTMLParagraphElement>()
  const [showAll, setShowAll] = useState(false)

  const onImagesClick = () =>
    router.push(
      versionUrl(productId, version.id, {
        section: 'images',
      }),
    )

  const onDeploymentsClick = () =>
    router.push(
      `${versionUrl(productId, version.id, {
        section: 'deployments',
      })}`,
    )

  return (
    <>
      <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col flex-grow')}>
        <div className="flex flex-col">
          <div className="flex flex-row flex-grow">
            <DyoHeading
              element="h5"
              className={clsx('text-lg text-bright', onClick ? 'cursor-pointer' : null)}
              onClick={onClick}
            >
              {version.name}
            </DyoHeading>

            <div className="flex flex-row ml-auto">
              {!version.default ? null : (
                <DyoTag className="ml-6" color="bg-error-red" textColor="text-error-red">
                  {t('default').toUpperCase()}
                </DyoTag>
              )}

              <DyoTag className="ml-6">{t(version.type).toUpperCase()}</DyoTag>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-end mt-4">
          <span className="text-bright font-bold">{`${t('common:updatedAt')}:`}</span>

          <span className="text-bright ml-2">{utcDateToLocale(version.updatedAt)}</span>
        </div>

        <span className="text-bright font-bold">{t('changelog')}</span>

        <p
          ref={overflowRef}
          className={clsx('text-md text-bright line-clamp-6 mt-2 max-h-44', overflow ? 'mb-6' : 'mb-8')}
        >
          {version.changelog}
        </p>

        {!overflow ? null : (
          <DyoButton className="ml-auto my-2" text onClick={() => setShowAll(true)}>
            {t('showAll')}
          </DyoButton>
        )}

        <div className={clsx('flex flex-row ml-auto', !overflow ? 'mt-auto' : 'mt-8')}>
          <DyoButton className="px-6 mx-2" outlined onClick={onDeploymentsClick}>
            {t('deployments')}
          </DyoButton>

          <DyoButton className="px-6 mx-2" outlined onClick={onImagesClick}>
            {t('images')}
          </DyoButton>

          {version.type === 'rolling' || !version.increasable ? null : (
            <DyoButton
              className="px-6 ml-2"
              color="ring-dyo-green"
              textColor="text-dyo-green"
              outlined
              onClick={props.onIncreaseClick}
            >
              {t('increase')}
            </DyoButton>
          )}
        </div>
      </DyoCard>

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
    </>
  )
}

export default VersionCard
