import { ROUTE_NODES } from '@app/routes'
import { expect, Page } from '@playwright/test'

export const createNode = async (page: Page, name: string) => {
  await page.goto(ROUTE_NODES)

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
