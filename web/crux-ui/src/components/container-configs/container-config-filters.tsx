import { DyoLabel } from '@app/elements/dyo-label'
import {
  ContainerConfigFilterType,
  COMMON_CONFIG_KEYS,
  CONTAINER_CONFIG_KEYS,
  ContainerConfigKey,
  CRANE_CONFIG_KEYS,
  DAGENT_CONFIG_KEYS,
} from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

type FilterSet = Record<ContainerConfigFilterType, ContainerConfigKey[]>

export const DEFAULT_FILTERS: FilterSet = {
  all: [...CONTAINER_CONFIG_KEYS],
  common: [...COMMON_CONFIG_KEYS],
  crane: [...CRANE_CONFIG_KEYS].filter(it => it !== 'extraLBAnnotations'),
  dagent: [...DAGENT_CONFIG_KEYS],
}

export const K8S_FILTERS: FilterSet = {
  all: [...COMMON_CONFIG_KEYS, ...CRANE_CONFIG_KEYS],
  common: [...COMMON_CONFIG_KEYS],
  crane: [...CRANE_CONFIG_KEYS].filter(it => it !== 'extraLBAnnotations'),
  dagent: null,
}

export const DOCKER_FILTERS: FilterSet = {
  all: [...COMMON_CONFIG_KEYS, ...DAGENT_CONFIG_KEYS],
  common: [...COMMON_CONFIG_KEYS],
  crane: null,
  dagent: [...DAGENT_CONFIG_KEYS],
}

const getBorderColor = (type: ContainerConfigFilterType): string => {
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

const getBgColor = (type: ContainerConfigFilterType): string => {
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

type ContainerConfigFilterProps = {
  onChange: (filters: ContainerConfigKey[]) => void
  filters: ContainerConfigKey[]
  filterSet?: FilterSet
}

const ContainerConfigFilters = (props: ContainerConfigFilterProps) => {
  const { onChange, filters, filterSet = DEFAULT_FILTERS } = props

  const filterSetKeys = Object.entries(filterSet)
    .filter(([_, value]) => !!value)
    .map(([key]) => key) as ContainerConfigFilterType[]

  const { t } = useTranslation('container')

  const onBaseFilterChanged = (value: ContainerConfigFilterType) => {
    const baseFilters = filterSet[value]
    const select = filters.filter(it => baseFilters.includes(it)).length === baseFilters.length

    if (select) {
      onChange(filters.filter(it => !baseFilters.includes(it)))
    } else {
      onChange([...filters, ...baseFilters.filter(it => !filters.includes(it))])
    }
  }

  const onFilterChanged = (value: ContainerConfigKey) => {
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
              ? filters.length === CONTAINER_CONFIG_KEYS.length
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

export default ContainerConfigFilters
