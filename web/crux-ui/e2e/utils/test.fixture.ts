import { test as base } from '@playwright/test'
import type { ChromiumBrowserContext } from 'playwright-core'

const THROTTLE = !!process.env.THROTTLE
const CPU_THROTTLE = process.env.CPUTHROTTLE
const REQUEST_THROTTLE = process.env.REQUESTTHROTTLE

export const test = base.extend({})

test.beforeEach(async ({ page }, testInfo) => {
  page.on('console', it => {
    const type = it.type()
    if (type === 'error' || type === 'warning' || type === 'trace') {
      console.log(`[${testInfo.title}] ${type.toUpperCase()} ${it.text()}`)
    }
  })

  if (THROTTLE) {
    const client = await (page.context() as ChromiumBrowserContext).newCDPSession(page)
    await client.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE ? Number.parseInt(CPU_THROTTLE) : 2 })
  }

  if (THROTTLE) {
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, REQUEST_THROTTLE ? Number.parseInt(REQUEST_THROTTLE) : 100))
      await route.continue()
    })
  }
})
