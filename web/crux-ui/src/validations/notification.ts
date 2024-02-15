/* eslint-disable import/prefer-default-export */
import { NOTIFICATION_TYPE_VALUES, NotificationType } from '@app/models'
import { nameRule } from './common'
import yup from './yup'

export const PATTERN_DISCORD = /^https:\/\/(discord|discordapp).com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_-]+)$/

export const PATTERN_SLACK =
  /^https:\/\/hooks.slack.com\/services\/T[0-9a-zA-Z]{10}\/B[0-9a-zA-Z]{10}\/[0-9a-zA-Z]{24}$/

export const PATTERN_TEAMS =
  /^https:\/\/[a-zA-Z]+.webhook.office.com\/webhookb2\/[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?\S+\/IncomingWebhook\//

export const PATTERN_ROCKET =
  /^https:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\/hooks\/[a-f0-9]{24}\/[a-zA-Z0-9]{32}\.?[a-zA-Z0-9]*$/

export const PATTERN_MATTERMOST =
  /^https:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\/hooks\/([a-zA-Z0-9]+)$/

export const notificationSchema = yup.object().shape({
  name: nameRule,
  type: yup
    .mixed<NotificationType>()
    .oneOf([...NOTIFICATION_TYPE_VALUES])
    .required()
    .label('notifications:notificationType'),
  url: yup
    .string()
    .url()
    .when('type', (values: [NotificationType], schema: yup.StringSchema<string, any, string>) => {
      const [type] = values

      let pattern: RegExp
      let errorMsg: string
      switch (type) {
        case 'discord':
          pattern = PATTERN_DISCORD
          errorMsg = 'https://discord(app).com/api/webhooks/ID/TOKEN'
          break
        case 'slack':
          pattern = PATTERN_SLACK
          errorMsg = 'https://hooks.slack.com/services/T0000000000/B0000000000/XXXXXXXXXXXXXXXXXXXXXXXX'
          break
        case 'teams':
          pattern = PATTERN_TEAMS
          errorMsg = 'https://subdomain.webhook.office.com/webhookb2/GUID/IncomingWebhook/'
          break
        case 'rocket':
          pattern = PATTERN_ROCKET
          errorMsg = 'https://subdomain.rocket.chat/hooks/TOKEN/ID'
          break
        case 'mattermost':
          pattern = PATTERN_MATTERMOST
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
    .required()
    .label('notifications:url'),
})
