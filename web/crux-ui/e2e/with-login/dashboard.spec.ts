import { API_USERS_ME_PREFERENCES_ONBOARDING, ROUTE_PROFILE } from '@app/routes'
import { expect, test } from '@playwright/test'
import { TEAM_ROUTES } from 'e2e/utils/common'

test.describe('Onboarding', () => {
  test('should be toggleable', async ({ page }) => {
    await page.goto(TEAM_ROUTES.dashboard.index())
    await page.waitForURL(TEAM_ROUTES.dashboard.index())
    await expect(page.locator('label:has-text("Onboarding")')).toBeVisible()

    await page.goto(ROUTE_PROFILE)

    let saveOnboarding = page.waitForResponse(it => it.url().includes(API_USERS_ME_PREFERENCES_ONBOARDING))
    await page.getByRole('switch', { name: 'Onboarding tips' }).click()
    await saveOnboarding

    await page.goto(TEAM_ROUTES.dashboard.index())
    await expect(page.locator('label:has-text("Onboarding")')).not.toBeVisible()

    await page.goto(ROUTE_PROFILE)
    saveOnboarding = page.waitForResponse(it => it.url().includes(API_USERS_ME_PREFERENCES_ONBOARDING))
    await page.getByRole('switch', { name: 'Onboarding tips' }).click()
    await saveOnboarding

    await page.goto(TEAM_ROUTES.dashboard.index())
    await expect(page.locator('label:has-text("Onboarding")')).toBeVisible()
  })

  test('should close after pressing hide', async ({ page }) => {
    await page.goto(TEAM_ROUTES.dashboard.index())

    const dashTitle = await page.locator('label:has-text("Onboarding")')
    await expect(dashTitle).toBeVisible()
    await page.locator('img[src="/close.svg"]').click()

    await expect(page.locator('h4:has-text("Are you sure?")')).toBeVisible()
    await page.locator('button:has-text("Hide")').click()

    await expect(dashTitle).not.toBeVisible()
  })
})
