// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from 'playwright'
import { TEAM_ROUTES } from './common'

export const createStorage = async (page: Page, name: string, url: string, accessKey: string, secretKey: string) => {
  await page.goto(TEAM_ROUTES.storage.list())
  await page.waitForSelector('h2:text-is("Storages")')

  await page.locator('button:has-text("Add")').click()
  await page.locator('div.card h4:has-text("New storage") >> visible=true')
  await page.locator('input[id="name"]').fill(name)
  await page.locator('input[id="url"]').fill(url)
  await page.locator('input[id="accessKey"]').fill(accessKey)
  await page.locator('input[id="secretKey"]').fill(secretKey)
  await page.locator('button:has-text("Save")').click()
  await page.locator(`div.card h3:has-text('${name}')`).click()
  await page.waitForURL(`${TEAM_ROUTES.storage.list()}/**`)
  return page.url().split('/').pop()
}

export const deleteStorage = async (page: Page, storageId: string) => {
  await page.goto(TEAM_ROUTES.storage.details(storageId))
  await page.waitForSelector('h2:text-is("Storages")')

  await page.locator('button:has-text("Delete")').click()
  await page.locator('div[role="dialog"] button:has-text("Delete")').click()
  await page.waitForURL(`${TEAM_ROUTES.storage.list()}`)
}
