/* eslint-disable import/prefer-default-export */
import * as yup from 'yup'
import { descriptionRule, iconRule, nameRule } from './common'

export const storageSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  icon: iconRule,
  url: yup.string().required(),
  accessKey: yup.string().required(),
  secretKey: yup.string().required(),
})
