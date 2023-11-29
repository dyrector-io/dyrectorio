import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoLink from '@app/elements/dyo-link'
import { ConfigBundle } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface ConfigBundleCardProps extends Omit<DyoCardProps, 'children'> {
  configBundle: ConfigBundle
  titleHref: string
}

const ConfigBundleCard = (props: ConfigBundleCardProps) => {
  const { configBundle, titleHref, className } = props

  const { t } = useTranslation('config-bundles')

  const title = (
    <div className="flex flex-row">
      <Image src="/config_bundle.svg" width={17} height={21} alt={t('altDefaultConfigBundlePicture')} />

      <DyoHeading className="text-xl text-bright font-semibold ml-2 my-auto mr-auto" element="h3">
        {configBundle.name}
      </DyoHeading>
    </div>
  )

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      {titleHref ? (
        <DyoLink href={titleHref} qaLabel="config-bundle-card-title">
          {title}
        </DyoLink>
      ) : (
        title
      )}

      <DyoExpandableText
        name="name"
        text={configBundle.description}
        lineClamp={2}
        className="text-md text-light mt-2 max-h-44"
        buttonClassName="ml-auto"
        modalTitle={configBundle.name}
      />
    </DyoCard>
  )
}

export default ConfigBundleCard
