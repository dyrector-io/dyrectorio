import { DyoLabel } from '@app/elements/dyo-label'
import {
  ALL_CONFIG_PROPERTIES,
  BaseImageConfigFilterType,
  COMMON_CONFIG_PROPERTIES,
  CRANE_CONFIG_PROPERTIES,
  DAGENT_CONFIG_PROPERTIES,
  ImageConfigProperty,
} from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

type FilterSet = Record<BaseImageConfigFilterType, ImageConfigProperty[]>

export const defaultFilterSet: FilterSet = {
  all: [...ALL_CONFIG_PROPERTIES],
  common: [...COMMON_CONFIG_PROPERTIES],
  crane: [...CRANE_CONFIG_PROPERTIES].filter(it => it !== 'extraLBAnnotations'),
  dagent: [...DAGENT_CONFIG_PROPERTIES],
}

export const k8sFilterSet: FilterSet = {
  all: [...COMMON_CONFIG_PROPERTIES, ...CRANE_CONFIG_PROPERTIES],
  common: [...COMMON_CONFIG_PROPERTIES],
  crane: [...CRANE_CONFIG_PROPERTIES].filter(it => it !== 'extraLBAnnotations'),
  dagent: null,
}

export const dockerFilterSet: FilterSet = {
  all: [...COMMON_CONFIG_PROPERTIES, ...DAGENT_CONFIG_PROPERTIES],
  common: [...COMMON_CONFIG_PROPERTIES],
  crane: null,
  dagent: [...DAGENT_CONFIG_PROPERTIES],
}

const getBorderColor = (type: BaseImageConfigFilterType): string => {
  switch (type) {
    case 'common':
      return 'border-dyo-orange/50'
    case 'crane':
      return 'border-dyo-violet/50'
    case 'dagent':
      return 'border-dyo-sky/50'
    default:
      return 'border-dyo-turquoise'
  }
}

const getBgColor = (type: BaseImageConfigFilterType): string => {
  switch (type) {
    case 'common':
      return 'bg-dyo-orange/50'
    case 'crane':
      return 'bg-dyo-violet/50'
    case 'dagent':
      return 'bg-dyo-sky/50'
    default:
      return 'bg-dyo-turquoise'
  }
}

type ImageConfigFilterProps = {
  onChange: (filters: ImageConfigProperty[]) => void
  filters: ImageConfigProperty[]
  filterSet?: FilterSet
}

const ImageConfigFilters = (props: ImageConfigFilterProps) => {
  const { onChange, filters, filterSet = defaultFilterSet } = props

  const filterSetKeys = Object.entries(filterSet)
    .filter(([_, value]) => !!value)
    .map(([key]) => key) as BaseImageConfigFilterType[]

  const { t } = useTranslation('container')

  const onBaseFilterChanged = (value: BaseImageConfigFilterType) => {
    const baseFilters = filterSet[value]
    const select = filters.filter(it => baseFilters.includes(it)).length === baseFilters.length

    if (select) {
      onChange(filters.filter(it => !baseFilters.includes(it)))
    } else {
      onChange([...filters, ...baseFilters.filter(it => !filters.includes(it))])
    }
  }

  const onFilterChanged = (value: ImageConfigProperty) => {
    const newFilters = filters.indexOf(value) !== -1 ? filters.filter(it => it !== value) : [...filters, value]
    onChange(newFilters)
  }

  return (
    <div className="flex flex-col">
      <DyoLabel className="font-medium text-light-eased">{t('base.filters')}</DyoLabel>

      <div className="flex my-2">
        {filterSetKeys.map((base, index) => {
          const selected =
            base === 'all'
              ? filters.length === ALL_CONFIG_PROPERTIES.length
              : filters.filter(it => filterSet[base].includes(it)).length === filterSet[base].length

          return (
            <button
              key={`filter-${index}`}
              type="button"
              className={clsx(
                `rounded-md border-2 px-2 py-1 m-1`,
                getBorderColor(base),
                selected ? `text-white ${getBgColor(base)} bg-opacity-30` : 'text-light-eased',
              )}
              onClick={() => onBaseFilterChanged(base)}
            >
              {t(`base.${base.toString()}`)}
            </button>
          )
        })}
      </div>

      <DyoLabel className="my-2 font-medium text-light-eased">{t('base.subFilters')}</DyoLabel>

      <div className="flex flex-wrap">
        {filterSetKeys.map(base =>
          base === 'all' ? null : (
            <div className="flex flex-wrap" key={`filter-base-${base}`}>
              {filterSet[base].map((value, index) => (
                <button
                  key={`filter-${value}-${index}`}
                  type="button"
                  className={clsx(
                    `rounded-md border-2 px-2 py-1 m-1`,
                    getBorderColor(base),
                    filters.indexOf(value) !== -1 ? `text-white ${getBgColor(base)} bg-opacity-30` : 'text-light-eased',
                  )}
                  onClick={() => onFilterChanged(value)}
                >
                  {t(`${base}.${value}`)}
                </button>
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  )
}

export default ImageConfigFilters
