import { ProjectType, PROJECT_TYPE_VALUES } from '@app/models/project'
import * as yup from 'yup'
import { descriptionRule, nameRule } from './common'

export const updateProjectSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
})

export const createProjectSchema = updateProjectSchema.concat(
  yup.object().shape({
    type: yup.mixed<ProjectType>().oneOf([...PROJECT_TYPE_VALUES]),
  }),
)
