import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import DyoMessage from '@app/elements/dyo-message'
import DyoRadioButton from '@app/elements/dyo-radio-button'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { RegistryImageTag } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useMemo, useState } from 'react'
import TagSortToggle, { SortState } from './tag-sort-toggle'
import LoadingIndicator from '@app/elements/loading-indicator'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoIndicator from '@app/elements/dyo-indicator'

interface ImageTagInputProps {
  disabled?: boolean
  selected: string
  onTagSelected: (tag: string) => void
}

type ImageTagSelectListProps = ImageTagInputProps & {
  tags: Record<string, RegistryImageTag>
  loadingTags: boolean
}

type Entry = [string, RegistryImageTag]

const ImageTagSelectList = (props: ImageTagSelectListProps) => {
  const { disabled, tags, selected: propsSelected, onTagSelected, loadingTags } = props

  const { t } = useTranslation('images')

  const [selected, setSelected] = useState(propsSelected)
  const [sortState, setSortState] = useState<SortState>({
    mode: 'date',
    dir: 1,
  })

  const filters = useFilters<Entry, TextFilter>({
    filters: [textFilterFor<Entry>(it => [it[0]])],
    initialData: Object.entries(tags),
    initialFilter: {
      text: '',
    },
  })

  useEffect(() => filters.setItems(Object.entries(tags)), [tags])

  const sortedItems = useMemo(() => {
    const items = filters.filtered
    switch (sortState.mode) {
      case 'alphabetic':
        return items.sort((a, b) => b[0].localeCompare(a[0]) * sortState.dir)
      case 'date':
        return items.sort((a, b) => {
          const aDate = a[1] == null ? 0 : Date.parse(a[1].created)
          const bDate = b[1] == null ? 0 : Date.parse(b[1].created)

          return Math.sign(bDate - aDate) * sortState.dir
        })
      default:
        return items
    }
  }, [sortState, filters.filtered])

  const isTagNewer = (tagIndex: number, currentTagIndex: number) =>
    currentTagIndex >= 0 &&
    ((sortState.dir === -1 && currentTagIndex < tagIndex) || (sortState.dir === 1 && currentTagIndex > tagIndex))

  const selectedTagIndex = selected ? sortedItems.findIndex(it => it[0] === selected) : -1

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
          <div className="flex flex-col max-h-96 overflow-y-auto">
            {sortedItems.map((it, index) => (
              <DyoRadioButton
                key={`tag-${it}`}
                disabled={disabled}
                label={it[0]}
                checked={it[0] === selected}
                onSelect={() => {
                  setSelected(it[0])
                  onTagSelected(it[0])
                }}
                qaLabel={`imageTag-${index}`}
                labelTemplate={label => (
                  <>
                    {isTagNewer(index, selectedTagIndex) && (
                      <DyoIndicator color="bg-dyo-violet" className="self-center" />
                    )}
                    <DyoLabel className="my-auto mx-2">{label}</DyoLabel>
                  </>
                )}
              />
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
