import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import { DyoExpandableText } from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTag from '@app/elements/dyo-tag'
import { Registry } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

interface RegistryCardProps extends Omit<DyoCardProps, 'children'> {
  registry: Registry
  onClick?: VoidFunction
}

const RegistryCard = (props: RegistryCardProps) => {
  const { t } = useTranslation('registries')

  const { registry, onClick } = props

  const getDefaultImage = () => {
    return <Image src="/default_registry.svg" width={17} height={21} alt={t('altDefaultRegistryPicture')} />
  }

  return (
    <>
      <DyoCard className={clsx(props.className ?? 'p-6', 'flex flex-col')}>
        <div className={clsx(onClick ? 'cursor-pointer' : null, 'flex flex-row')} onClick={onClick}>
          {!registry.icon ? getDefaultImage() : <DyoBadge icon={registry.icon} />}

          <DyoHeading className="text-xl text-bright font-semibold ml-2 my-auto mr-auto" element="h3">
            {registry.name}
          </DyoHeading>
        </div>

        <div className="flex flex-row my-4">
          <DyoLabel className="mr-auto">{registry.url}</DyoLabel>
        </div>

        <DyoExpandableText
          text={registry.description}
          lineClamp={2}
          className="text-md text-light mt-2 max-h-44"
          buttonClassName="ml-auto"
          modalTitle={registry.name}
        />

        <div className="flex flex-row flex-grow mt-4 justify-end">
          <DyoTag color="bg-dyo-turquoise" textColor="text-dyo-turquoise">
            {t(`type.${registry.type}`)}
          </DyoTag>
        </div>
      </DyoCard>
    </>
  )
}

export default RegistryCard
