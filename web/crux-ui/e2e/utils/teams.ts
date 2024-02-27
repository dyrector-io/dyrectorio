/* eslint-disable import/no-extraneous-dependencies */
import { ROUTE_TEAMS, teamUrl } from '@app/routes'
import { Page } from 'playwright'

export const createTeam = async (page: Page, name: string, slug: string) => {
  await page.goto(ROUTE_TEAMS)
  await page.waitForSelector('h2:text-is("Teams")')

  await page.locator('button:has-text("Add")').click()
  await page.locator('input[name="name"]').fill(name)
  await page.locator('input[name="slug"]').fill(slug)
  await page.locator('button:has-text("Save")').click()
  await page.locator(`h4:text-is("${name}")`).click()

  await page.waitForURL(`${ROUTE_TEAMS}/**`)
  return page.url().split('/').pop()
}

export const deleteTeam = async (page: Page, teamId: string) => {
  await page.goto(teamUrl(teamId))
  await page.waitForSelector('h2:text-is("Teams")')

  await page.locator('button:has-text("Delete")').click()
  const overlay = await page.locator('div[role="dialog"]')
  await overlay.locator('button:has-text("Delete")').click()
  await page.waitForURL(ROUTE_TEAMS)
}
