import { ALL_CONFIG_PROPERTIES, ContainerConfigData, ImageConfigProperty } from '@app/models'
import { ContainerConfigValidationErrors, findErrorStartsWith } from '@app/validations'

const configToFilters = <T extends ContainerConfigData>(
  current: ImageConfigProperty[],
  configData: T,
  fieldErrors?: ContainerConfigValidationErrors,
): ImageConfigProperty[] => {
  const newFilters = ALL_CONFIG_PROPERTIES.filter(it => {
    const value = configData[it]

    if (fieldErrors && findErrorStartsWith(fieldErrors, it)) {
      return true
    }

    if (typeof value === 'number') {
      return value !== null && value !== undefined
    }

    if (!value) {
      return false
    }

    if (Array.isArray(value) && value.length < 1) {
      return false
    }

    if (typeof value === 'object') {
      return Object.keys(value).length > 0
    }

    return true
  })

  const missing = newFilters.filter(it => !current.includes(it))
  return missing.length < 1 ? current : current.concat(missing)
}

export default configToFilters
