import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoImgButton from '@app/elements/dyo-img-button'
import DyoTag from '@app/elements/dyo-tag'
import { Version } from '@app/models'
import { versionUrl } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import VersionTypeTag from './version-type-tag'

interface VersionCardProps {
  className?: string
  disabled?: boolean
  productId: string
  version: Version
  onClick?: VoidFunction
  onIncreaseClick?: VoidFunction
  onSetAsDefaultClick?: VoidFunction
}

const VersionCard = (props: VersionCardProps) => {
  const { className, productId, version, onClick, disabled, onIncreaseClick, onSetAsDefaultClick } = props

  const { t } = useTranslation('versions')

  const router = useRouter()

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
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col flex-grow w-full')}>
      <div className="flex flex-col">
        <div className="flex flex-row flex-grow">
          <DyoHeading
            element="h5"
            className={clsx('text-xl text-bright', onClick ? 'cursor-pointer' : null)}
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

            <VersionTypeTag className="ml-6" type={version.type} />
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-end mt-4">
        <span className="text-bright font-bold">{`${t('common:updatedAt')}:`}</span>

        <span className="text-bright ml-2">{utcDateToLocale(version.updatedAt)}</span>
      </div>

      <div className="flex flex-row my-2">
        {!onIncreaseClick || !version.increasable ? null : (
          <DyoImgButton
            className="px-2 h-6"
            disabled={disabled}
            src="/arrow_up_bold.svg"
            alt={t('increase')}
            width={18}
            height={18}
            outlined
            onClick={onIncreaseClick}
          />
        )}

        {!onSetAsDefaultClick || version.default ? null : (
          <DyoImgButton
            className="px-2 h-6 mx-2"
            disabled={disabled}
            src="/home_bold.svg"
            alt={t('default')}
            width={18}
            height={18}
            outlined
            onClick={onSetAsDefaultClick}
          />
        )}
      </div>

      <span className="text-bright font-semibold">{t('changelog')}</span>

      <DyoExpandableText
        text={version.changelog ? version.changelog : t('emptyChangelog')}
        lineClamp={6}
        className="text-md text-bright mt-2 max-h-44"
        buttonClassName="w-fit mb-8"
        modalTitle={t('changelogName', { name: version.name })}
      />

      {disabled ? null : (
        <div className="flex flex-row ml-auto mt-auto">
          <DyoButton className="px-4 mx-2" outlined onClick={onImagesClick}>
            <div className="flex flex-row items-center gap-2">
              <Image src="/images.svg" alt={t('images')} width={20} height={20} layout="fixed" />

              {t('images')}
            </div>
          </DyoButton>

          <DyoButton className="px-4 mx-2" outlined onClick={onDeploymentsClick}>
            <div className="flex flex-row items-center gap-2">
              <Image src="/deployments.svg" alt={t('deployments')} width={20} height={20} layout="fixed" />

              {t('deployments')}
            </div>
          </DyoButton>
        </div>
      )}
    </DyoCard>
  )
}

export default VersionCard
