import { ROUTE_STORAGES, storageUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { createStorage, deleteStorage } from 'e2e/utils/storages'

const TEST_URL = 'https://test.storage.com'
const TEST_ACCESS_KEY = '1234'
const TEST_SECRET_KEY = '12345678'

test('Can create storage', async ({ page }) => {
  const storageName = 'storage-create-test'
  await createStorage(page, storageName, TEST_URL, TEST_ACCESS_KEY, TEST_SECRET_KEY)
  await page.goto(ROUTE_STORAGES)
  await expect(page.locator(`div.card h3:has-text('${storageName}')`)).toBeVisible()
})

test('Required field text should show up', async ({ page }) => {
  await page.goto(ROUTE_STORAGES)
  await page.locator('button:has-text("Add")').click()
  await page.locator('h4:has-text("New storage") >> visible=true')
  await page.locator('button:has-text("Save")').click()
  await expect(page.getByText(/\**is a required field/)).toHaveCount(4)
})

test('Wrong url should show error', async ({ page }) => {
  const storageName = 'storage-url-filter-test'
  const storageId = await createStorage(page, storageName, TEST_URL, TEST_ACCESS_KEY, TEST_SECRET_KEY)
  await page.goto(storageUrl(storageId))
  await page.locator('button:has-text("Edit")').click()
  await page.locator('input[id="url"]').fill('https://notaurl')
  await page.locator('button:has-text("Save")').click()
  await expect(page.locator('div[role="status"]:has-text("url must be a URL address")')).toBeVisible()
})

test('Minimum name length requirement should work', async ({ page }) => {
  await page.goto(ROUTE_STORAGES)
  await page.locator('button:has-text("Add")').click()
  await page.locator('h4:has-text("New storage") >> visible=true')
  await page.locator('input[name="name"]').fill('12')
  await page.locator('button:has-text("Save")').click()
  await expect(page.locator('p:has-text("name must be at least 3 characters")')).toBeVisible()
})

test('Can edit storage name', async ({ page }) => {
  const storageName = 'storage-name-edit-test'
  const storageId = await createStorage(page, storageName, TEST_URL, TEST_ACCESS_KEY, TEST_SECRET_KEY)
  await page.goto(storageUrl(storageId))
  await page.locator('button:has-text("Edit")').click()
  await page.locator('input[id="name"]').fill(storageName.concat('-edited'))
  await page.locator('button:has-text("Save")').click()
  await expect(page.locator(`div.card h3:has-text('${storageName}-edited')`)).toBeVisible()
})

test('Can edit storage url', async ({ page }) => {
  const storageName = 'storage-url-edit-test'
  const storageId = await createStorage(page, storageName, TEST_URL, TEST_ACCESS_KEY, TEST_SECRET_KEY)
  await page.goto(storageUrl(storageId))
  await page.locator('button:has-text("Edit")').click()
  let newUrl = (await removeUrlDomainSuffix(TEST_URL)).concat(`.edited.${TEST_URL.split('.').pop()}`)
  await page.locator('input[id="url"]').fill(newUrl)
  await page.locator('button:has-text("Save")').click()
  await expect(page.locator(`div.card label:has-text('${newUrl}')`)).toBeVisible()
})

test('Can delete storage', async ({ page }) => {
  const storageName = 'storage-delete-test'
  const storageId = await createStorage(page, storageName, TEST_URL, TEST_ACCESS_KEY, TEST_SECRET_KEY)
  await page.goto(ROUTE_STORAGES)
  await expect(page.locator(`div.card h3:has-text('${storageName}')`)).toBeVisible()
  await deleteStorage(page, storageId)
  await page.goto(ROUTE_STORAGES)
  await expect(page.locator(`div.card h3:has-text('${storageName}')`)).not.toBeVisible()
})

const removeUrlDomainSuffix = async (url: string) => {
  let split = url.split('.')
  return split
    .splice(0, split.length - 1)
    .toString()
    .replaceAll(',', '.')
}
