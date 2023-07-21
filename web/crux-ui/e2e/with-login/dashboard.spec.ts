import { ROUTE_DASHBOARD, ROUTE_PROFILE } from '@app/routes'
import { expect, test } from '@playwright/test'

test.describe('Onboarding', () => {
  test('should be toggleable', async ({ page }) => {
    await page.goto(ROUTE_DASHBOARD)
    await page.waitForURL(ROUTE_DASHBOARD)
    await expect(page.locator('label:has-text("Onboarding")')).toBeVisible()

    await page.goto(ROUTE_PROFILE)
    await page.locator('button[role="switch"]').click()

    await page.goto(ROUTE_DASHBOARD)
    await expect(page.locator('label:has-text("Onboarding")')).not.toBeVisible()

    await page.goto(ROUTE_PROFILE)
    await page.locator('button[role="switch"]').click()

    await page.goto(ROUTE_DASHBOARD)
    await expect(page.locator('label:has-text("Onboarding")')).toBeVisible()
  })

  test('should close after pressing hide', async ({ page }) => {
    await page.goto(ROUTE_DASHBOARD)

    const dashTitle = await page.locator('label:has-text("Onboarding")')
    await expect(dashTitle).toBeVisible()
    await page.locator('img[src="/close.svg"]').click()

    await expect(page.locator('h4:has-text("Are you sure?")')).toBeVisible()
    await page.locator('button:has-text("Hide")').click()

    await expect(dashTitle).not.toBeVisible()
  })
})
