import { IMAGE_FILTER_MIN_LENGTH, IMAGE_WS_REQUEST_DELAY } from '@app/const'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoCheckbox from '@app/elements/dyo-checkbox'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoList } from '@app/elements/dyo-list'
import { defaultWsErrorHandler } from '@app/errors'
import { useThrottleing } from '@app/hooks/use-throttleing'
import { useWebSocket } from '@app/hooks/use-websocket'
import {
  FindImageMessage,
  FindImageResult,
  FindImageResultMessage,
  Registry,
  WS_TYPE_DYO_ERROR,
  WS_TYPE_FIND_IMAGE,
  WS_TYPE_FIND_IMAGE_RESULT,
} from '@app/models'
import { API_REGISTRIES, WS_REGISTRIES } from '@app/routes'
import { fetcher } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import React, { useEffect, useState } from 'react'
import useSWR from 'swr'

interface SelectImagesCardProps {
  className?: string
  onImagesSelected: (registry: Registry, images: FindImageResult[]) => void
  onDiscard: VoidFunction
}

const SelectImagesCard = (props: SelectImagesCardProps) => {
  const { t } = useTranslation('images')

  const { data: registries, error: fetchRegistriesError } = useSWR<Registry[]>(API_REGISTRIES, fetcher)
  const [registry, setRegistry] = useState<Registry>(null)
  const [selected, setSelected] = useState<FindImageResult[]>([])
  const [images, setImages] = useState<FindImageResult[]>([])
  const [filter, setFilter] = useState('')
  const throttleFilter = useThrottleing(IMAGE_WS_REQUEST_DELAY)

  const registriesFound = registries?.length > 0

  const sock = useWebSocket(WS_REGISTRIES)

  sock.on(WS_TYPE_FIND_IMAGE_RESULT, (message: FindImageResultMessage) => {
    if (message.registryId === registry?.id && filter.length >= IMAGE_FILTER_MIN_LENGTH) {
      setImages(message.images)
    }
  })

  sock.on(WS_TYPE_DYO_ERROR, defaultWsErrorHandler(t))

  useEffect(() => setRegistry(registriesFound ? registries[0] : null), [registries, registriesFound])

  const findImage = (registry: Registry, filter?: string) => {
    if (!registry || filter.length < IMAGE_FILTER_MIN_LENGTH) {
      setImages([])
      return
    }

    const send = () => {
      sock.send(WS_TYPE_FIND_IMAGE, {
        registryId: registry.id,
        filter,
      } as FindImageMessage)
    }

    throttleFilter(send)
  }

  const onRegistrySelectionChange = (registry: Registry) => {
    setRegistry(registry)
    findImage(registry, filter)
  }

  const onFilterChange = (filter: string) => {
    setFilter(filter)
    findImage(registry, filter)
  }

  const onImageCheckedChange = (image: FindImageResult, checked: boolean) => {
    if (checked) {
      if (!selected.find(it => it.name === image.name)) {
        setSelected([...selected, image])
      }
    } else {
      setSelected(selected.filter(it => it.name !== image.name))
    }
  }

  const onAdd = () => {
    const images = selected
    setSelected([])
    props.onImagesSelected(registry, images)
  }

  const filterResult = [...selected, ...images.filter(image => !selected.find(it => it.name === image.name))]

  return (
    <>
      <DyoCard className={props.className}>
        <div className="flex flex-row">
          <DyoHeading element="h4" className="text-lg text-bright">
            {t('add')}
          </DyoHeading>

          <DyoButton outlined secondary className="ml-auto mr-2 px-10" onClick={props.onDiscard}>
            {t('common:discard')}
          </DyoButton>

          {selected.length < 1 ? null : (
            <DyoButton outlined className="ml-2 px-10" onClick={onAdd}>
              {t('common:add')}
            </DyoButton>
          )}
        </div>

        {fetchRegistriesError ? (
          <DyoLabel>
            {t('errors:fetchFailed', {
              type: t('versions:images'),
            })}
          </DyoLabel>
        ) : !registries ? (
          <DyoLabel>{t('common:loading')}</DyoLabel>
        ) : (
          <div className="flex flex-col">
            <div className="flex flex-wrap mt-4">
              <DyoLabel className="ml-8 mr-2 my-auto">{t('registry')}</DyoLabel>

              <DyoChips
                choices={registries}
                initialSelection={[registries[0]]}
                converter={(it: Registry) => it.name}
                onChoicesChange={it => onRegistrySelectionChange(it[0])}
              />
            </div>

            <DyoInput
              className="max-w-lg"
              grow
              label={t('imageName')}
              value={filter}
              onChange={event => onFilterChange(event.target.value)}
              messageType={'info'}
              message={
                filter?.length < IMAGE_FILTER_MIN_LENGTH
                  ? t('filterMinChars', { length: IMAGE_FILTER_MIN_LENGTH })
                  : null
              }
            />

            {filterResult.length < 1 ? null : (
              <DyoList
                className="mt-4"
                data={filterResult}
                headers={['imageName'].map(it => t(it))}
                itemBuilder={image => {
                  const checked = !!selected.find(it => it.name === image.name)
                  const onCheckedChange = checked => onImageCheckedChange(image, checked)

                  /* eslint-disable react/jsx-key */
                  return [
                    <div className="flex flex-row p-auto">
                      <DyoCheckbox className="my-auto mr-2" checked={!!checked} onCheckedChange={onCheckedChange} />
                      <DyoLabel onClick={() => onCheckedChange(!checked)}>{image.name}</DyoLabel>
                    </div>,
                  ]
                  /* eslint-enable react/jsx-key */
                }}
              />
            )}
          </div>
        )}
      </DyoCard>
    </>
  )
}

export default SelectImagesCard
