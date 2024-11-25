import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoLink from '@app/elements/dyo-link'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ConfigBundle } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

type ConfigBundleCardProps = {
  className?: string
  configBundle: ConfigBundle
}

const ConfigBundleCard = (props: ConfigBundleCardProps) => {
  const { configBundle, className } = props

  const { t } = useTranslation('config-bundles')
  const routes = useTeamRoutes()
  const titleHref = routes.configBundle.details(configBundle.id)

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      <DyoLink className="flex flex-row" href={titleHref} qaLabel="config-bundle-card-title">
        <Image src="/config_bundle.svg" width={17} height={21} alt={t('altDefaultConfigBundlePicture')} />

        <DyoHeading className="text-xl text-bright font-semibold ml-2 my-auto mr-auto" element="h3">
          {configBundle.name}
        </DyoHeading>
      </DyoLink>

      <DyoExpandableText
        name="name"
        text={configBundle.description}
        lineClamp={2}
        className="text-md text-light mt-2 max-h-44"
        buttonClassName="ml-auto"
        modalTitle={configBundle.name}
      />

      <div className="flex flex-row ml-auto mt-auto">
        <DyoButton className="px-2" outlined href={routes.containerConfig.details(configBundle.configId)}>
          <div className="flex flex-row items-center gap-2">
            <Image
              className="aspect-square"
              src="/container_config_turquoise.svg"
              alt={t('common:config')}
              width={24}
              height={24}
            />
            {t('common:config')}
          </div>
        </DyoButton>
      </div>
    </DyoCard>
  )
}

export default ConfigBundleCard
