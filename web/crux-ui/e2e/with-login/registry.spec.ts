import { expect } from '@playwright/test'
import { test } from '../utils/test.fixture'
import { clearInput, NGINX_TEST_IMAGE_WITH_TAG, screenshotPath, TEAM_ROUTES } from '../utils/common'
import { createProject } from '../utils/projects'

test('adding a new registry should work', async ({ page }) => {
  await page.goto(TEAM_ROUTES.registry.list())
  await page.waitForSelector('h2:text-is("Registries")')

  await page.locator('text=Add').click()
  await expect(page.locator('h4')).toContainText('New registry')

  await page.locator('input[name=name] >> visible=true').fill('TEST REGISTRY')
  await page.locator('form >> text=Docker Hub').click()
  await expect(await page.locator('label[for=imageNamePrefix]')).toContainText('Organization name or username')
  await page.locator('input[name=imageNamePrefix]').fill('library')

  await page.screenshot({ path: screenshotPath('registry_new_filled'), fullPage: true })

  await page.locator('text=Save').click()

  await page.waitForURL(TEAM_ROUTES.registry.list())
  await page.waitForSelector('h2:text-is("Registries")')

  await expect(page.locator(`h3:text("TEST REGISTRY")`)).toHaveCount(1)

  await page.screenshot({ path: screenshotPath('registry_new'), fullPage: true })
})

test('minimum name length requirement should work', async ({ page }) => {
  await page.goto(TEAM_ROUTES.registry.list())
  await page.waitForSelector('h2:text-is("Registries")')

  await page.locator('text=Add').click()
  await expect(page.locator('h4')).toContainText('New registry')

  await page.locator('input[name=name]').fill('12')
  await page.locator('form >> text=Docker Hub').click()
  await expect(await page.locator('label[for=imageNamePrefix]')).toContainText('Organization name or username')
  await page.locator('input[name=imageNamePrefix]').fill('library')

  await page.locator('text=Save').click()

  await expect(await page.locator('p.text-error-red')).toContainText('Name must be at least 3 characters')

  await page.screenshot({ path: screenshotPath('registry_new_name_length'), fullPage: true })
})

test("Unchecked registry shouldn't search images", async ({ page }) => {
  const registryName = 'REGISTRY_UNCHECKED'

  await page.goto(TEAM_ROUTES.registry.list())
  await page.waitForSelector('h2:text-is("Registries")')

  await page.locator('text=Add').click()
  await expect(page.locator('h4')).toContainText('New registry')

  await page.locator('input[name=name]').fill(registryName)
  await page.locator('form >> text=Unchecked').click()
  await expect(await page.locator('label[for=url]')).toContainText('URL')
  await page.locator('input[name=url]').fill('index.docker.io')

  await page.locator('text=Save').click()
  await page.waitForSelector(`h3:text-is("${registryName}")`)

  await createProject(page, 'unchecked-project', 'versionless')

  await page.locator('button:has-text("Add image")').click()
  await expect(page.locator('h4:has-text("Add image")')).toHaveCount(1)

  await page.locator(`button:text-is("${registryName}")`).click()

  await expect(page.locator('label[for=imageName]')).toContainText('Image name and tag')

  await clearInput(page.locator('input[name=imageName]'))
  await page.locator('input[name=imageName]').type(`${NGINX_TEST_IMAGE_WITH_TAG}:mainline-alpine`)
  await expect(page.locator('input[name=imageName] >> xpath=../../p')).toContainText(
    "Invalid format, please use 'NAME[:TAG]'",
  )
  await expect(page.locator('button:text-is("Add")')).not.toBeVisible()

  await clearInput(page.locator('input[name=imageName]'))
  await page.locator('input[name=imageName]').type('')
  await expect(page.locator('input[name=imageName] >> xpath=../../p')).toContainText(
    "Invalid format, please use 'NAME[:TAG]'",
  )
  await expect(page.locator('button:text-is("Add")')).not.toBeVisible()

  await clearInput(page.locator('input[name=imageName]'))
  await page.locator('input[name=imageName]').type('nginx')
  await expect(page.locator('input[name=imageName] >> xpath=../../p')).not.toBeVisible()
  await expect(page.locator('button:text-is("Add")')).toBeVisible()

  await clearInput(page.locator('input[name=imageName]'))
  await page.locator('input[name=imageName]').type(NGINX_TEST_IMAGE_WITH_TAG)
  await expect(page.locator('input[name=imageName] >> xpath=../../p')).not.toBeVisible()
  await expect(page.locator('button:text-is("Add")')).toBeVisible()

  await page.locator('button:text-is("Add")').click()

  const imagesRows = await page.locator('table.w-full >> tbody >> tr')
  await expect(imagesRows).toHaveCount(1)
})

test('Image list should be visible', async ({ page }) => {
  const registryName = 'TEST REGISTRY IMAGE LIST'

  await page.goto(TEAM_ROUTES.registry.list())

  await page.locator('text=Add').click()
  await expect(page.locator('h4')).toContainText('New registry')

  await page.locator('input[name=name] >> visible=true').fill(registryName)
  await page.locator('form >> text=Docker Hub').click()
  await expect(await page.locator('label[for=imageNamePrefix]')).toContainText('Organization name or username')
  await page.locator('input[name=imageNamePrefix]').fill('library')

  await page.locator('text=Save').click()

  await page.waitForURL(TEAM_ROUTES.registry.list())

  await page.locator(`h3:has-text("${registryName}")`).click()
  await expect(page.locator('button:has-text("Edit")')).toBeVisible()

  await page.locator('input[placeholder="Search"]').type('nginx')

  await expect(page.getByText('nginx')).toHaveCount(1)
})
