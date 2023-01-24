import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoRadioButton from '@app/elements/dyo-radio-button'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'

interface ImageTagInputProps {
  disabled?: boolean
  selected: string
  onTagSelected: (tag: string) => void
}

type ImageTagSelectListProps = ImageTagInputProps & {
  tags: string[]
}

const ImageTagSelectList = (props: ImageTagSelectListProps) => {
  const { disabled, tags, selected: propsSelected, onTagSelected } = props

  const [selected, setSelected] = useState(propsSelected)

  const { t } = useTranslation('images')

  const filters = useFilters<string, TextFilter>({
    filters: [textFilterFor<string>(it => [it])],
    initialData: tags,
    initialFilter: {
      text: '',
    },
  })

  useEffect(() => filters.setItems(tags), [filters, tags])

  return (
    <div className="flex flex-col">
      <DyoInput
        className="w-2/3 mt-6 mb-8"
        placeholder={t('common:search')}
        onChange={e =>
          filters.setFilter({
            text: e.target.value,
          })
        }
      />

      <DyoHeading element="h5" className="text-lg text-bright font-bold">
        {t('availableTags')}
      </DyoHeading>

      {selected ? null : <DyoMessage messageType="info" message={t('selectTag')} />}

      <div className="flex flex-col max-h-96 overflow-y-auto">
        {filters.filtered.map(it => (
          <DyoRadioButton
            key={`tag-${it}`}
            disabled={disabled}
            label={it}
            checked={it === selected}
            onSelect={() => {
              setSelected(it)
              onTagSelected(it)
            }}
          />
        ))}
      </div>
    </div>
  )
}

const ImageTagInput = (props: ImageTagInputProps) => {
  const { disabled, selected: propsSelected, onTagSelected } = props

  const { t } = useTranslation('images')

  const [selected, setSelected] = useState(propsSelected)

  return (
    <div className="flex flex-col mt-6 mb-8">
      <DyoInput
        label={t('tag')}
        labelClassName="mb-2.5"
        placeholder={t('tag')}
        disabled={disabled}
        value={selected}
        onChange={e => {
          const { value } = e.target
          setSelected(value)
          if (value?.length > 0) {
            onTagSelected(value)
          }
        }}
        messageType="info"
        message={!selected.length && t('tagRequired')}
      />
      <p className="text-light-eased ml-4 mt-2">{t('uncheckedRegistryExplanation')}</p>
    </div>
  )
}

const EditImageTags = (props: ImageTagSelectListProps) => {
  const { tags } = props
  return tags ? <ImageTagSelectList {...props} /> : <ImageTagInput {...props} />
}

export default EditImageTags
