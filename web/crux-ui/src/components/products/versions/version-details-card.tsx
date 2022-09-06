import { DyoCard } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoTag from '@app/elements/dyo-tag'
import { Version } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

interface VersionDetailsCardProps {
  className?: string
  version: Version
}

const VersionDetailsCard = (props: VersionDetailsCardProps) => {
  const { className, version } = props

  const { t } = useTranslation('versions')

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      <DyoHeading element="h2" className="text-xl font-bold text-bright">
        {version.name}
      </DyoHeading>

      <div className="flex flex-row">
        <div className="flex flex-col">
          <DyoExpandableText
            text={version.changelog}
            lineClamp={6}
            className="text-md text-light mt-4"
            buttonClassName="w-fit"
            modalTitle={t('changelogName', { name: version.name })}
          />
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
    </DyoCard>
  )
}

export default VersionDetailsCard
