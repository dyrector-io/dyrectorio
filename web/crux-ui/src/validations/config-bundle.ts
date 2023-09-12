/* eslint-disable import/prefer-default-export */
import * as yup from 'yup'
import { nameRule } from './common'

export const configBundleCreateSchema = yup.object().shape({
  name: nameRule,
})

export const configBundlePatchSchema = yup.object().shape({
  name: nameRule.optional().nullable(),
  environment: yup.array().optional().nullable(),
})
