import { VersionType, VERSION_TYPE_VALUES } from '@app/models'
import yup from './yup'
import { descriptionRule, nameRule } from './common'

// Ref: https://ihateregex.io/expr/semver/
export const versionRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

export const increaseVersionSchema = yup.object().shape({
  name: nameRule,
  changelog: descriptionRule,
})

export const updateVersionSchema = increaseVersionSchema

export const createVersionSchema = updateVersionSchema.concat(
  yup.object().shape({
    type: yup
      .mixed<VersionType>()
      .oneOf([...VERSION_TYPE_VALUES])
      .label('type'),
  }),
)
