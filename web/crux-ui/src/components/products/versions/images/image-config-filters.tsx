import { DyoLabel } from '@app/elements/dyo-label'
import { ImageConfigFilterType, IMAGE_CONFIG_FILTERS } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'

type BaseImageConfigFilterType = 'all' | 'common' | 'dagent' | 'crane'
type FilterSet = Record<BaseImageConfigFilterType, ImageConfigFilterType[]>

export const filterSet: FilterSet = {
  all: [],
  common: [
    'name',
    'environment',
    'secrets',
    'ingress',
    'expose',
    'user',
    'tty',
    'importContainer',
    'configContainer',
    'ports',
    'portRanges',
    'volumes',
    'commands',
    'args',
    'initContainers',
  ],
  crane: [
    'deploymentStrategy',
    'customHeaders',
    'proxyHeaders',
    'loadBalancer',
    'healthCheckConfig',
    'resourceConfig',
    'annotations',
    'labels',
  ],
  dagent: ['logConfig', 'restartPolicy', 'networkMode', 'networks', 'dockerLabels'],
}

interface ImageConfigFilterProps {
  onChange: (filters: ImageConfigFilterType[]) => void
}

const ImageConfigFilters = (props: ImageConfigFilterProps) => {
  const { onChange } = props

  const { t } = useTranslation('container')

  const [filters, setFilters] = useState<ImageConfigFilterType[]>(
    IMAGE_CONFIG_FILTERS as any as ImageConfigFilterType[],
  )

  const onBaseFilterChanged = (value: BaseImageConfigFilterType) => {
    const filtersByBase = value !== 'all' ? filterSet[value] : IMAGE_CONFIG_FILTERS
    const select = filters.filter(it => filtersByBase.indexOf(it) !== -1).length === filtersByBase.length

    if (select) {
      setFilters(filters.filter(it => filtersByBase.indexOf(it) === -1))
    } else {
      setFilters([...filters, ...filtersByBase.filter(it => filters.indexOf(it) === -1)])
    }
  }

  const onFilterChanged = (value: ImageConfigFilterType) => {
    const newFilters = filters.indexOf(value) !== -1 ? filters.filter(it => it !== value) : [...filters, value]
    setFilters(newFilters)
  }

  useEffect(() => onChange(filters), [filters, onChange])

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

  return (
    <div className="flex flex-col">
      <DyoLabel className="font-medium text-light-eased">Filters</DyoLabel>
      <div className="flex mt-2">
        {(Object.keys(filterSet) as BaseImageConfigFilterType[]).map((base, index) => {
          const selected =
            base === 'all'
              ? filters.length === IMAGE_CONFIG_FILTERS.length
              : filters.filter(it => filterSet[base].indexOf(it) !== -1).length === filterSet[base].length
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
      <DyoLabel className="mt-4 font-medium text-light-eased">Sub filters</DyoLabel>
      <div className="flex flex-row flex-wrap mt-2">
        {(Object.keys(filterSet) as BaseImageConfigFilterType[]).map(base => (
          <div className="mb-2" key={`filter-base-${base}`}>
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
        ))}
      </div>
    </div>
  )
}

export default ImageConfigFilters
