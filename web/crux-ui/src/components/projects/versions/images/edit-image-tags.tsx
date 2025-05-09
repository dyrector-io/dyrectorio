import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoRadioButton from '@app/elements/dyo-radio-button'
import LoadingIndicator from '@app/elements/loading-indicator'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { RegistryImageTag } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useMemo, useState } from 'react'
import TagSortToggle, { TagSortState } from './tag-sort-toggle'

type ImageTagInputProps = {
  disabled?: boolean
  selected: string
  onTagSelected: (tag: string) => void
}

type SelectImageTagListProps = ImageTagInputProps & {
  tags: RegistryImageTag[]
  loadingTags: boolean
}

const SelectImageTagList = (props: SelectImageTagListProps) => {
  const { disabled, tags, selected: propsSelected, onTagSelected, loadingTags } = props

  const { t } = useTranslation('images')

  const [selected, setSelected] = useState(propsSelected)
  const [sortState, setSortState] = useState<TagSortState>({
    mode: 'date',
    direction: 'desc',
  })

  const filters = useFilters<RegistryImageTag, TextFilter>({
    filters: [textFilterFor<RegistryImageTag>(it => [it.name, it.created])],
    initialData: tags,
    initialFilter: {
      text: '',
    },
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => filters.setItems(tags), [tags])

  const sortedItems = useMemo(() => {
    const dir = sortState.direction === 'asc' ? -1 : 1

    const items = filters.filtered

    switch (sortState.mode) {
      case 'alphabetical':
        return [...items].sort((one, other) => other.name.localeCompare(one.name) * dir)
      case 'date':
        return [...items].sort((one, other) => {
          if (!one.created) {
            return other.created ? -1 : 1 * dir
          }

          const oneDate = Date.parse(one.created)
          const otherDate = Date.parse(other.created)

          return Math.sign(otherDate - oneDate) * dir
        })
      default:
        return items
    }
  }, [sortState, filters.filtered])

  const selectedTag = tags.find(it => it.name === selected) ?? null

  const newerThanSelected = (tag: RegistryImageTag): boolean => {
    if (!selectedTag?.created) {
      return false
    }

    return Date.parse(tag.created) > Date.parse(selectedTag.created)
  }

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

      <div className="flex">
        <DyoHeading element="h5" className="flex-1 text-lg text-bright font-bold">
          {t('availableTags')}
        </DyoHeading>
        <TagSortToggle state={sortState} onStateChange={setSortState} />
      </div>

      {loadingTags ? (
        <LoadingIndicator />
      ) : (
        <>
          {selected ? null : <DyoMessage messageType="info" message={t('selectTag')} />}
          <div className="flex flex-col max-h-96 overflow-y-auto mt-2">
            {sortedItems.map((it, index) => (
              <div className="flex flex-row gap-2 justify-between">
                <DyoRadioButton
                  key={`tag-${it}`}
                  disabled={disabled}
                  label={it.name}
                  checked={it.name === selected}
                  onSelect={() => {
                    setSelected(it.name)
                    onTagSelected(it.name)
                  }}
                  qaLabel={`image-tag-${index}`}
                  labelTemplate={label => (
                    <>
                      <DyoLabel className="my-auto mx-2">{label}</DyoLabel>

                      {newerThanSelected(it) && (
                        <span className="text-dyo-green bg-dyo-green bg-opacity-10 rounded-full bg-opacity-10 text-xs font-semibold h-fit px-2 py-0.5 my-auto">
                          {t('common:new')}
                        </span>
                      )}
                    </>
                  )}
                />

                {it.created && <span className="text-bright-muted">{utcDateToLocale(it.created)}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const ImageTagInput = (props: ImageTagInputProps) => {
  const { disabled, selected: propsSelected, onTagSelected } = props

  const { t } = useTranslation('images')

  const [selected, setSelected] = useState(propsSelected ?? '')

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

const EditImageTags = (props: SelectImageTagListProps) => {
  const { tags } = props
  return tags ? <SelectImageTagList {...props} /> : <ImageTagInput {...props} />
}

export default EditImageTags
