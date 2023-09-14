import { ProjectType, PROJECT_TYPE_VALUES } from '@app/models'
import yup from './yup'
import { descriptionRule, nameRule } from './common'

// eslint-disable-next-line import/prefer-default-export
export const applyTemplateSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  type: yup
    .mixed<ProjectType>()
    .oneOf([...PROJECT_TYPE_VALUES])
    .label('projects:versioning'),
})
