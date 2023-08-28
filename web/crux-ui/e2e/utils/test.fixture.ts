import { test as base } from '@playwright/test'
import type { ChromiumBrowserContext } from 'playwright-core'

const CPU_THROTTLE = process.env.CPUTHROTTLE
const REQUEST_THROTTLE = process.env.REQUESTTHROTTLE
const DEBUG = !!process.env.REQUESTTHROTTLE

const LOG_LEVELS = DEBUG ? ['error', 'warning', 'info', 'debug', 'trace'] : ['error', 'warning']

export const test = base.extend({})

test.beforeEach(async ({ page }, testInfo) => {
  page.on('console', it => {
    const type = it.type()

    if (!LOG_LEVELS.includes(type)) {
      return
    }

    const text = it.text()
    if (text.includes('Insecure WebSocket connection in production environment!')) {
      return
    }

    console.log(`[${testInfo.title}] ${type.toUpperCase()} ${it.text()}`)
  })

  if (CPU_THROTTLE) {
    const client = await (page.context() as ChromiumBrowserContext).newCDPSession(page)
    await client.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE ? Number.parseInt(CPU_THROTTLE) : 2 })
  }

  if (REQUEST_THROTTLE) {
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, REQUEST_THROTTLE ? Number.parseInt(REQUEST_THROTTLE) : 100))
      await route.continue()
    })
  }
})

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = testInfo.outputPath(`failure.png`)
    const pageHtml = await page.content()
    const pageHtmlBuffer = Buffer.from(pageHtml, 'utf-8')

    await page.screenshot({ path: screenshotPath, timeout: 5000, fullPage: true })

    await testInfo.attach('failure-screenshot', { path: screenshotPath, contentType: 'image/png' })
    await testInfo.attach('failure-page-html', { body: pageHtmlBuffer, contentType: 'text/html' })
  }
})
