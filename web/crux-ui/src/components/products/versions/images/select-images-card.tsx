import { IMAGE_FILTER_MIN_LENGTH, IMAGE_WS_REQUEST_DELAY } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoCheckbox from '@app/elements/dyo-checkbox'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoList } from '@app/elements/dyo-list'
import LoadingIndicator from '@app/elements/loading-indicator'
import { useThrottling } from '@app/hooks/use-throttleing'
import useWebSocket from '@app/hooks/use-websocket'
import {
  DyoApiError,
  FindImageMessage,
  FindImageResult,
  FindImageResultMessage,
  Registry,
  RegistryImages,
  WS_TYPE_DYO_ERROR,
  WS_TYPE_FIND_IMAGE,
  WS_TYPE_FIND_IMAGE_RESULT,
} from '@app/models'
import { API_REGISTRIES, WS_REGISTRIES } from '@app/routes'
import { fetcher } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

interface SelectImagesCardProps {
  className?: string
  onImagesSelected: (images: RegistryImages[]) => void
  onDiscard: VoidFunction
}

const SelectImagesCard = (props: SelectImagesCardProps) => {
  const { className, onDiscard, onImagesSelected } = props

  const { t } = useTranslation('images')

  const { data: registries, error: fetchRegistriesError } = useSWR<Registry[]>(API_REGISTRIES, fetcher)
  const [searching, setSearching] = useState(false)
  const [registry, setRegistry] = useState<Registry>(null)
  const [selected, setSelected] = useState<SelectableImage[]>([])
  const [images, setImages] = useState<SelectableImage[]>([])
  const [filter, setFilter] = useState('')
  const throttleFilter = useThrottling(IMAGE_WS_REQUEST_DELAY)

  const registriesFound = registries?.length > 0

  const sock = useWebSocket(WS_REGISTRIES)

  sock.on(WS_TYPE_FIND_IMAGE_RESULT, (message: FindImageResultMessage) => {
    if (message.registryId === registry?.id && filter.length >= IMAGE_FILTER_MIN_LENGTH) {
      setSearching(false)
      setImages(
        message.images.map(it => ({
          registryId: message.registryId,
          image: it,
        })),
      )
    }
  })

  sock.on(WS_TYPE_DYO_ERROR, (_: DyoApiError) => {
    setSearching(false)
  })

  useEffect(() => setRegistry(registriesFound ? registries[0] : null), [registries, registriesFound])

  const findImage = (reg: Registry, fil?: string) => {
    if (!reg || filter.length < IMAGE_FILTER_MIN_LENGTH) {
      setImages([])
      setSearching(false)
      return
    }

    const send = () => {
      sock.send(WS_TYPE_FIND_IMAGE, {
        registryId: reg.id,
        filter: fil,
      } as FindImageMessage)
    }

    setSearching(true)
    throttleFilter(send)
  }

  const onRegistrySelectionChange = (reg: Registry) => {
    setRegistry(reg)
    findImage(reg, filter)
  }

  const onFilterChange = (filterValue: string) => {
    setFilter(filterValue)
    findImage(registry, filterValue)
  }

  const onImageCheckedChange = (target: SelectableImage, checked: boolean) => {
    if (checked) {
      if (!selected.find(it => it.image.name === target.image.name)) {
        setSelected([...selected, target])
      }
    } else {
      setSelected(selected.filter(it => it.image.name !== target.image.name))
    }
  }

  const onAdd = () => {
    const registryToImages: Map<string, RegistryImages> = new Map()
    selected.forEach(it => {
      let registryImage = registryToImages.get(it.registryId)
      if (!registryImage) {
        registryImage = {
          registryId: it.registryId,
          images: [],
        }
        registryToImages.set(it.registryId, registryImage)
      }

      registryImage.images.push(it.image.name)
    })

    setSelected([])
    onImagesSelected(Array.from(registryToImages.values()))
  }

  const filterResult = [
    ...selected,
    ...images.filter(selectable => !selected.find(it => it.image.name === selectable.image.name)),
  ]

  const itemTemplate = (selectable: SelectableImage) => {
    const checked = !!selected.find(it => it.image.name === selectable.image.name)
    const onCheckedChange = isChecked => onImageCheckedChange(selectable, isChecked)

    /* eslint-disable react/jsx-key */
    return [
      <div className="flex flex-row p-auto">
        <DyoCheckbox className="my-auto mr-2" checked={!!checked} onCheckedChange={onCheckedChange} />
        <DyoLabel onClick={() => onCheckedChange(!checked)}>{selectable.image.name}</DyoLabel>
      </div>,
    ]
    /* eslint-enable react/jsx-key */
  }

  return (
    <DyoCard className={className}>
      <div className="flex flex-row">
        <DyoHeading element="h4" className="text-lg text-bright">
          {t('add')}
        </DyoHeading>

        <DyoButton outlined secondary className="ml-auto mr-2 px-10" onClick={onDiscard}>
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
            <DyoLabel className="ml-8 mr-2 my-auto">{t('common:registry')}</DyoLabel>

            <DyoChips
              choices={registries}
              initialSelection={registries[0]}
              converter={(it: Registry) => it.name}
              onSelectionChange={it => onRegistrySelectionChange(it)}
            />
          </div>

          <DyoInput
            className="max-w-lg"
            name="imageName"
            grow
            label={t('imageName')}
            value={filter}
            onChange={event => onFilterChange(event.target.value)}
            messageType="info"
            message={
              filter?.length < IMAGE_FILTER_MIN_LENGTH ? t('filterMinChars', { length: IMAGE_FILTER_MIN_LENGTH }) : null
            }
          />

          {filterResult.length < 1 ? (
            filter.length < 1 ? null : searching ? (
              <LoadingIndicator className="mt-4" />
            ) : (
              <DyoLabel className="mt-4">{t('common:noNameFound', { name: t('common:images') })}</DyoLabel>
            )
          ) : (
            <DyoList
              className="mt-4"
              data={filterResult}
              headers={['imageName'].map(it => t(it))}
              itemBuilder={itemTemplate}
            />
          )}
        </div>
      )}
    </DyoCard>
  )
}

export default SelectImagesCard

type SelectableImage = {
  registryId: string
  image: FindImageResult
}
