// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, Page } from '@playwright/test'
import { TEAM_ROUTES } from './common'

// eslint-disable-next-line import/prefer-default-export
export const createNode = async (page: Page, name: string) => {
  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('button:has-text("Add")').click()
  await expect(page.locator('h4:has-text("New node")')).toHaveCount(1)

  await page.locator('input[name=name] >> visible=true').fill(name)

  await page.locator('button:has-text("Save")').click()

  const item = await page.waitForSelector(`h3:has-text("${name}")`)

  await item.click()

  await page.waitForSelector(`label:has-text("${name}")`)
  await page.waitForSelector(`h3:has-text("${name}")`)

  return page.url().split('/').pop()
}
