import { DyoLabel } from '@app/elements/dyo-label'
import { ImageConfigFilterType, IMAGE_CONFIG_FILTERS } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'

type BaseImageConfigFilterType = 'all' | 'common' | 'docker' | 'kubernetes'
type FilterSet = Record<BaseImageConfigFilterType, ImageConfigFilterType[]>

export const filterSet: FilterSet = {
  all: [],
  common: [
    'name',
    'environments',
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
  kubernetes: [
    'deploymentStrategy',
    'customHeaders',
    'proxyHeaders',
    'loadBalancer',
    'healthCheckConfig',
    'resourceConfig',
  ],
  docker: ['logConfig', 'restartPolicy', 'networkMode', 'networks'],
}

interface ImageConfigFitlerProps {
  onChange: (filters: ImageConfigFilterType[]) => void
}

const ImageConfigFilters = (props: ImageConfigFitlerProps) => {
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

  useEffect(() => onChange(filters), [filters])

  // Render

  const getBorderColor = (type: BaseImageConfigFilterType): string => {
    switch (type) {
      case 'common':
        return 'border-orange-400/50'
      case 'kubernetes':
        return 'border-violet-400/50'
      case 'docker':
        return 'border-sky-400/50'
      default:
        return 'border-dyo-turquoise'
    }
  }

  const getBgColor = (type: BaseImageConfigFilterType): string => {
    switch (type) {
      case 'common':
        return 'bg-orange-400/50'
      case 'kubernetes':
        return 'bg-violet-400/50'
      case 'docker':
        return 'bg-sky-400/50'
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
        {(Object.keys(filterSet) as BaseImageConfigFilterType[]).map(base => {
          return (
            <div className="mb-2" key={`filter-base-${base}`}>
              {filterSet[base].map((value, index) => {
                return (
                  <button
                    key={`filter-${value}-${index}`}
                    type="button"
                    className={clsx(
                      `rounded-md border-2 px-2 py-1 m-1`,
                      getBorderColor(base),
                      filters.indexOf(value) !== -1
                        ? `text-white ${getBgColor(base)} bg-opacity-30`
                        : 'text-light-eased',
                    )}
                    onClick={() => onFilterChanged(value)}
                  >
                    {t(`${base}.${value}`)}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ImageConfigFilters
