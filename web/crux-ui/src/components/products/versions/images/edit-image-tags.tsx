import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoRadioButton from '@app/elements/dyo-radio-button'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'

interface EditImageTagsProps {
  disabled?: boolean
  selected: string
  tags: string[]
  onTagSelected: (tag: string) => void
}

const EditImageTags = (props: EditImageTagsProps) => {
  const { disabled, tags, selected, onTagSelected } = props

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
            onSelect={() => onTagSelected(it)}
          />
        ))}
      </div>
    </div>
  )
}

export default EditImageTags
