import { PATTERN_DISCORD, PATTERN_MATTERMOST, PATTERN_ROCKET, PATTERN_SLACK, PATTERN_TEAMS } from './notification'

describe('notifications validation tests', () => {
  describe('discord', () => {
    it('valid url should be accepted', () => {
      const candidate =
        'https://discord.com/api/webhooks/1111111111111111111/AAAAAAAAAAAAAAAAAAAAA3333333333aaaaaaaaaaa1A3a3A3a3-1111111111abcAbc'

      const expected = true

      const actual = PATTERN_DISCORD.test(candidate)

      expect(actual).toBe(expected)
    })

    it('valid url with "discordapp" domain should be accepted', () => {
      const candidate =
        'https://discordapp.com/api/webhooks/1111111111111111111/AAAAAAAAAAAAAAAAAAAAA3333333333aaaaaaaaaaa1A3a3A3a3-1111111111abcAbc'

      const expected = true

      const actual = PATTERN_DISCORD.test(candidate)

      expect(actual).toBe(expected)
    })

    it('url with bad domain should be declined', () => {
      const candidate =
        'https://discor.com/api/webhooks/1111111111111111111/AAAAAAAAAAAAAAAAAAAAA3333333333aaaaaaaaaaa1A3a3A3a3-1111111111abcAbc'

      const expected = false

      const actual = PATTERN_DISCORD.test(candidate)

      expect(actual).toBe(expected)
    })

    it('invalid url should be declined', () => {
      const candidate =
        'https://discord/api/webhooks/1111111111111111111/AAAAAAAAAAAAAAAAAAAAA3333333333aaaaaaaaaaa1A3a3A3a3-1111111111abcAbc'

      const expected = false

      const actual = PATTERN_DISCORD.test(candidate)

      expect(actual).toBe(expected)
    })
  })

  describe('slack', () => {
    it('valid url should be accepted', () => {
      const candidate = 'https://hooks.slack.com/services/T1234567890/B1234567890/abcd1234efgh5678ijkl90zy'

      const expected = true

      const actual = PATTERN_SLACK.test(candidate)

      expect(actual).toBe(expected)
    })

    it('url with bad domain should be declined', () => {
      const candidate = 'https://hooks.slac.com/services/T0000000000/B0000000000/XXXXXXXXXXXXXXXXXXXXXXXX/'

      const expected = false

      const actual = PATTERN_SLACK.test(candidate)

      expect(actual).toBe(expected)
    })

    it('invalid url should be declined', () => {
      const candidate = 'https://hooks/services/T0000000000/B0000000000/XXXXXXXXXXXXXXXXXXXXXXXX/'

      const expected = false

      const actual = PATTERN_SLACK.test(candidate)

      expect(actual).toBe(expected)
    })
  })

  describe('teams', () => {
    it('valid url should be accepted', () => {
      const candidate =
        'https://teamname.webhook.office.com/webhookb2/aaaa1111-aa11-aa11-aa11-aaaa1111aa11@aaaa1111-aa11-aa11-aa11-aaaa1111aa11/IncomingWebhook/2216fd46d95a471aa096d75f156a6138/aaaa1111-aa11-aa11-aa11-aaaa1111aa11'

      const expected = true

      const actual = PATTERN_TEAMS.test(candidate)

      expect(actual).toBe(expected)
    })

    it('url with bad domain should be declined', () => {
      const candidate =
        'https://teamname.webhook.offic.com/webhookb2/aaaa1111-aa11-aa11-aa11-aaaa1111aa11@aaaa1111-aa11-aa11-aa11-aaaa1111aa11/IncomingWebhook/2216fd46d95a471aa096d75f156a6138/aaaa1111-aa11-aa11-aa11-aaaa1111aa11'

      const expected = false

      const actual = PATTERN_TEAMS.test(candidate)

      expect(actual).toBe(expected)
    })

    it('invalid url should be declined', () => {
      const candidate =
        'https://office/webhookb2/aaaa1111-aa11-aa11-aa11-aaaa1111aa11@aaaa1111-aa11-aa11-aa11-aaaa1111aa11/IncomingWebhook/2216fd46d95a471aa096d75f156a6138/aaaa1111-aa11-aa11-aa11-aaaa1111aa11'

      const expected = false

      const actual = PATTERN_TEAMS.test(candidate)

      expect(actual).toBe(expected)
    })
  })

  describe('rocket', () => {
    it('valid url should be accepted', () => {
      const candidate =
        'https://test.rocket.chat/hooks/aaaaaaaaaaaaaaaaaab4aa3a/aaaaa3aBaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

      const expected = true

      const actual = PATTERN_ROCKET.test(candidate)

      expect(actual).toBe(expected)
    })

    it('valid custom url should be accepted', () => {
      const candidate =
        'https://custom.url/hooks/aaaaaaaaaaaaaaaaaab4aa3a/aaaaa3aBaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

      const expected = true

      const actual = PATTERN_ROCKET.test(candidate)

      expect(actual).toBe(expected)
    })

    it('invalid url should be declined', () => {
      const candidate = 'https://rocket/hooks/TOKEN/ID'

      const expected = false

      const actual = PATTERN_ROCKET.test(candidate)

      expect(actual).toBe(expected)
    })
  })

  describe('mattermost', () => {
    it('valid url should be accepted', () => {
      const candidate = 'https://your.subdomain.com/hooks/ID'

      const expected = true

      const actual = PATTERN_MATTERMOST.test(candidate)

      expect(actual).toBe(expected)
    })

    it('invalid url should be declined', () => {
      const candidate = 'https://rocket/hooks/TOKEN/ID'

      const expected = false

      const actual = PATTERN_MATTERMOST.test(candidate)

      expect(actual).toBe(expected)
    })
  })
})
