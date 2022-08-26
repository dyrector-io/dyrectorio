import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoExpandableText } from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoImgButton from '@app/elements/dyo-img-button'
import DyoTag from '@app/elements/dyo-tag'
import { Version } from '@app/models'
import { versionUrl } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

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
  const { t } = useTranslation('versions')

  const router = useRouter()

  const { className, productId, version, onClick } = props

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

            <DyoTag className="ml-6">{t(version.type).toUpperCase()}</DyoTag>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-end mt-4">
        <span className="text-bright font-bold">{`${t('common:updatedAt')}:`}</span>

        <span className="text-bright ml-2">{utcDateToLocale(version.updatedAt)}</span>
      </div>

      <div className="flex flex-row my-2">
        {!props.onIncreaseClick || !version.increasable ? null : (
          <DyoImgButton
            className="px-2 h-6 mr-2"
            disabled={props.disabled}
            src="/arrow_up_bold.svg"
            alt={t('increase')}
            width={18}
            height={18}
            outlined
            onClick={props.onIncreaseClick}
          />
        )}

        {!props.onSetAsDefaultClick || version.default ? null : (
          <DyoImgButton
            className="px-2 h-8 mx-2"
            disabled={props.disabled}
            src="/home_bold.svg"
            alt={t('default')}
            width={18}
            height={18}
            outlined
            onClick={props.onSetAsDefaultClick}
          />
        )}
      </div>

      <span className="text-bright font-bold">{t('changelog')}</span>

      <DyoExpandableText
        text={version.changelog}
        lineClamp={6}
        className="text-md text-bright mt-2 max-h-44"
        buttonClassName="w-fit mb-8"
        modalTitle={t('changelogName', { name: version.name })}
      />

      {props.disabled ? null : (
        <div className="flex flex-row ml-auto mt-auto">
          <DyoButton className="px-6 mx-2" outlined onClick={onDeploymentsClick}>
            {t('deployments')}
          </DyoButton>

          <DyoButton className="px-6 mx-2" outlined onClick={onImagesClick}>
            {t('images')}
          </DyoButton>
        </div>
      )}
    </DyoCard>
  )
}

export default VersionCard
