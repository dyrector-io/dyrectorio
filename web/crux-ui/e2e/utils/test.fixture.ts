/* eslint-disable import/no-extraneous-dependencies */
import { ChromiumBrowserContext, Page, TestInfo, test as base } from '@playwright/test'

const CPU_THROTTLE = process.env.CPUTHROTTLE
const REQUEST_THROTTLE = process.env.REQUESTTHROTTLE
const DEBUG = !!process.env.REQUESTTHROTTLE

const LOG_LEVELS = DEBUG ? ['error', 'warning', 'info', 'debug', 'trace'] : ['error', 'warning']

// eslint-disable-next-line import/prefer-default-export
export const test = base.extend({})

export const hookTestPageEvents = (page: Page, testInfo: TestInfo) => {
  page.on('console', it => {
    const type = it.type()

    if (!LOG_LEVELS.includes(type)) {
      return
    }

    const text = it.text()
    if (text.includes('Insecure WebSocket connection in production environment!')) {
      return
    }

    console.info(`[${testInfo.title}] ${type.toUpperCase()} ${it.text()}`)
  })

  page.on('request', it => {
    if (!it.url().includes('/api/')) {
      return
    }

    console.info(`[${testInfo.title}] Request started ${it.method()} ${it.url()}`)
  })

  page.on('close', it => {
    console.info(`[${testInfo.title}] Page close ${it.url()}`)
  })
  page.on('requestfailed', it => {
    if (!it.url().includes('/api/')) {
      return
    }

    console.info(`[${testInfo.title}] Request failed ${it.method()} ${it.url()}`)
  })
  page.on('requestfinished', async it => {
    if (!it.url().includes('/api/')) {
      return
    }

    const res = await it.response()
    console.info(`[${testInfo.title}] Request finished ${res.status()} ${it.method()} ${it.url()}`)
  })
  page.on('response', it => {
    if (!it.url().includes('/api/')) {
      return
    }

    console.info(`[${testInfo.title}] Response to ${it.url()}`)
  })
}

test.beforeEach(async ({ page }, testInfo) => {
  hookTestPageEvents(page, testInfo)

  if (CPU_THROTTLE) {
    const client = await (page.context() as ChromiumBrowserContext).newCDPSession(page)
    await client.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE ? Number.parseInt(CPU_THROTTLE, 10) : 2 })
  }

  if (REQUEST_THROTTLE) {
    await page.route('**/*', async route => {
      // eslint-disable-next-line no-promise-executor-return
      await new Promise(resolve => setTimeout(resolve, REQUEST_THROTTLE ? Number.parseInt(REQUEST_THROTTLE, 10) : 100))
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
