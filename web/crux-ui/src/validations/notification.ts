/* eslint-disable import/prefer-default-export */
import { NotificationType, NOTIFICATION_TYPE_VALUES } from '@app/models/notification'
import * as yup from 'yup'
import { AnyObject } from 'yup/lib/types'
import { nameRule } from './common'

export const notificationSchema = yup.object().shape({
  name: nameRule,
  type: yup
    .mixed<NotificationType>()
    .oneOf([...NOTIFICATION_TYPE_VALUES])
    .required(),
  url: yup
    .string()
    .url()
    .when('type', (type: NotificationType, schema: yup.StringSchema<string, AnyObject, string>) => {
      let pattern: RegExp
      switch (type) {
        case 'discord':
          pattern = /^https:\/\/(discord|discordapp).com\/api\/webhooks/
          break
        case 'slack':
          pattern = /^https:\/\/hooks.slack.com\/services/
          break
        case 'teams':
          pattern = /^https:\/\/[a-zA-Z]+.webhook.office.com/
          break
        default:
          break
      }

      if (!pattern) {
        return schema
      }

      return schema.matches(pattern)
    })
    .required(),
})
