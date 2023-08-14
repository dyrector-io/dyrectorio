import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { ConfigBundle } from '@app/models/config-bundle'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'

interface ConfigBundleCardProps extends Omit<DyoCardProps, 'children'> {
  configBundle: ConfigBundle
  titleHref?: string
}

const ConfigBundleCard = (props: ConfigBundleCardProps) => {
  const { configBundle, titleHref, className } = props

  const { t } = useTranslation('config-bundles')

  const title = (
    <div className="flex flex-row">
      <Image src="/default_config_bundle.svg" width={17} height={21} alt={t('altDefaultConfigBundlePicture')} />

      <DyoHeading className="text-xl text-bright font-semibold ml-2 my-auto mr-auto" element="h3">
        {configBundle.name}
      </DyoHeading>
    </div>
  )

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      {titleHref ? <Link href={titleHref}>{title}</Link> : title}
    </DyoCard>
  )
}

export default ConfigBundleCard
