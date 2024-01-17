/* eslint-disable import/prefer-default-export */
import yup from './yup'
import { descriptionRule, iconRule, nameRule } from './common'

const secretRule = yup.string().when(['public', 'changeCredentials'], {
  is: (pub: boolean, changeCredentials: boolean) => !pub && changeCredentials,
  then: s => s.required(),
  otherwise: s => s.optional().nullable(),
})

export const storageSchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  icon: iconRule,
  url: yup.string().required().label('storages:url'),
  accessKey: secretRule.label('storages:accessKey'),
  secretKey: secretRule.label('storages:secretKey'),
})
