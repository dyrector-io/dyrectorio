/* eslint-disable import/prefer-default-export */
import yup from './yup'
import { descriptionRule, iconRule, nameRule } from './common'

export const storageSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  icon: iconRule,
  url: yup.string().required().label('url'),
  accessKey: yup.string().required().label('accessKey'),
  secretKey: yup.string().required().label('secretKey'),
})
