import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { Registry } from '@app/models'
import clsx from 'clsx'
import React from 'react'
import Image from 'next/image'
import useTranslation from 'next-translate/useTranslation'

interface RegistryCardProps extends Omit<DyoCardProps, 'children'> {
  registry: Registry
  onClick?: VoidFunction
}

const RegistryCard = (props: RegistryCardProps) => {
  const { registry, onClick } = props
  const { t } = useTranslation("registries")

  const getDefaultImage = () => {
    return <Image src="/default_registry.svg" width={17} height={21} alt={t("altDefaultRegistryPicture")}/>
  }

  return (
    <>
      <DyoCard className={clsx(props.className ?? 'p-6', 'flex flex-col')}>
        <div className={clsx(onClick ? 'cursor-pointer' : null, 'flex flex-row flex-grow')} onClick={onClick}>
          {!registry.icon ? getDefaultImage() : <DyoBadge icon={registry.icon} />}

          <DyoHeading className="text-xl text-bright font-semibold ml-2 my-auto mr-auto" element="h3">
            {registry.name}
          </DyoHeading>
        </div>

        <div className="flex flex-row flex-grow my-4">
          <DyoLabel className="mr-auto">{registry.url}</DyoLabel>
        </div>

        <p className="text-light line-clamp-4">{registry.description}</p>
      </DyoCard>
    </>
  )
}

export default RegistryCard
