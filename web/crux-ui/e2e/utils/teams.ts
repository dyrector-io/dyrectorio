import { ROUTE_TEAMS, teamUrl } from '@app/routes'
import { Page } from 'playwright'

export const createTeam = async (page: Page, name: string) => {
  await page.goto(ROUTE_TEAMS)
  await page.locator('button:has-text("Add")').click()
  await page.locator('input[id="name"]').fill(name)
  await page.locator('button:has-text("Save")').click()
  await page.locator(`h4:has-text('${name}')`).click()
  await page.waitForURL(`${ROUTE_TEAMS}/**`)
  return page.url().split('/').pop()
}

export const deleteTeam = async (page: Page, teamId: string) => {
  await page.goto(teamUrl(teamId))
  await page.locator('button:has-text("Delete")').click()
  await page.locator('div[role=dialog] button:has-text("Delete")').click()
  await page.waitForURL(ROUTE_TEAMS)
}
