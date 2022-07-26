import DyoBadge from '@app/elements/dyo-badge'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTag from '@app/elements/dyo-tag'
import { Registry } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'

interface RegistryCardProps extends Omit<DyoCardProps, 'children'> {
  registry: Registry
  onClick?: VoidFunction
}

const RegistryCard = (props: RegistryCardProps) => {
  const { t } = useTranslation("registries");

  const { registry, onClick } = props

  return (
    <>
      <DyoCard className={clsx(props.className ?? 'p-6', 'flex flex-col')}>
        <div className={clsx(onClick ? 'cursor-pointer' : null, 'flex flex-row flex-grow')} onClick={onClick}>
          {!registry.icon ? null : <DyoBadge icon={registry.icon} />}

          <DyoHeading className="text-xl text-bright font-semibold ml-4 my-auto mr-auto" element="h3">
            {registry.name}
          </DyoHeading>
        </div>

        <div className="flex flex-row flex-grow my-4">
          <DyoLabel className="mr-auto">{registry.url}</DyoLabel>
        </div>

        <p className="text-light line-clamp-4">{registry.description}</p>

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
