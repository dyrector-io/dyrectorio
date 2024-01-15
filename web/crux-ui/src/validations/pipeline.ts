import { PipelineRepository, PipelineType } from '@app/models'
import * as yup from 'yup'
import { descriptionRule, iconRule, nameRule } from './common'
import { uniqueKeyValuesSchema } from './container'

export const updatePipelineSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  icon: iconRule,
  type: yup.mixed<PipelineType>().oneOf(['azure']).required(),
  repository: yup.mixed<PipelineRepository>().when(['type'], {
    is: (type: PipelineType) => type === 'azure',
    then: () =>
      yup.object().shape({
        organization: yup.string().required().label('organization'),
        project: yup.string().required().label('common:project'),
      }),
  }),
  trigger: yup.object().shape({
    name: yup.string().required().label('pipelineName'),
    inputs: uniqueKeyValuesSchema,
  }),
  token: yup.string().nullable(),
})

export const createPipelineSchema = updatePipelineSchema.concat(
  yup.object().shape({
    token: yup.string().required().label('common:token'),
  }),
)
