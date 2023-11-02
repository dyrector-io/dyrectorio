/* eslint-disable import/prefer-default-export */
import { NotificationType, NOTIFICATION_TYPE_VALUES } from '@app/models/notification'
import * as yup from 'yup'
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
    .when('type', (values: [NotificationType], schema: yup.StringSchema<string, any, string>) => {
      const [type] = values

      let pattern: RegExp
      let errorMsg: string
      switch (type) {
        case 'discord':
          pattern = /^https:\/\/(discord|discordapp).com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_-]+)$/
          errorMsg = 'https://discord(app).com/api/webhooks/ID/TOKEN'
          break
        case 'slack':
          pattern = /^https:\/\/hooks.slack.com\/services\/T[0-9a-zA-Z]{10}\/B[0-9a-zA-Z]{10}\/[0-9a-zA-Z]{24}$/
          errorMsg = 'https://hooks.slack.com/services/T0000000000/B0000000000/XXXXXXXXXXXXXXXXXXXXXXXX/'
          break
        case 'teams':
          pattern =
            /^https:\/\/[a-zA-Z]+.webhook.office.com\/webhookb2\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?\S+\/IncomingWebhook\//
          errorMsg = 'https://subdomain.webhook.office.com/webhookb2/GUID/IncomingWebhook/'
          break
        case 'mattermost':
          pattern = /^https:\/\/([a-zA-Z0-9.-]+)\.([a-zA-Z0-9.-]+)\.com\/hooks\/([a-zA-Z0-9]+)$/
          errorMsg = 'https://your.subdomain.com/hooks/ID'
          break
        default:
          break
      }

      if (!pattern) {
        return schema
      }

      return schema.matches(pattern, errorMsg)
    })
    .required(),
})
