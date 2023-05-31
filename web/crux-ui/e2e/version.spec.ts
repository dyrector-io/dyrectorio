import { projectUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { versionUrl } from './../src/routes'
import { DAGENT_NODE } from './utils/common'
import { addDeploymentToVersion, createImage, createProject, createVersion } from './utils/projects'

test('Add incremental version should work', async ({ page }) => {
  const projectId = await createProject(page, 'PW-INCREMENTAL', 'Complex')
  await createVersion(page, projectId, '1.0.0', 'Incremental')

  await page.goto(projectUrl(projectId))

  await expect(await page.locator('h5:has-text("1.0.0")')).toBeVisible()
})

test('Add rolling version should work', async ({ page }) => {
  const projectId = await createProject(page, 'PW-COMPLEX', 'Complex')
  await createVersion(page, projectId, '1.0.0', 'Rolling')

  await page.goto(projectUrl(projectId))

  await expect(await page.locator('h5:has-text("1.0.0")')).toBeVisible()
})

test("New version should get the default version's images and deployments", async ({ page }) => {
  const projectId = await createProject(page, 'PW-NEW-CHILD', 'Complex')
  const parentVersion = await createVersion(page, projectId, '1.0.0', 'Incremental')
  await createImage(page, projectId, parentVersion, 'nginx')
  await addDeploymentToVersion(page, projectId, parentVersion, DAGENT_NODE)

  const childVersion = await createVersion(page, projectId, '2.0.0', 'Incremental')

  await page.goto(projectUrl(projectId))

  await expect(page.locator('div.bg-dyo-blue:has-text("Incremental")')).toHaveCount(2)
  await expect(page.locator(`div.bg-error-red:has-text("DEFAULT"):right-of(h5:has-text("1.0.0"))`)).toHaveCount(1)
  await expect(page.locator(`div.bg-error-red:has-text("DEFAULT"):right-of(h5:has-text("2.0.0"))`)).toHaveCount(0)

  await page.goto(versionUrl(projectId, childVersion, { section: 'images' }))

  const imagesTableBody = await page.locator('.table-row-group')
  const imagesRows = await imagesTableBody.locator('.table-row')

  await expect(imagesRows).toHaveCount(1)

  await page.goto(versionUrl(projectId, childVersion, { section: 'deployments' }))

  await expect(await page.locator(`h3:has-text("You haven't added a deployment to this version")`)).toHaveCount(0)
})

test('Change default version should work', async ({ page }) => {
  const projectId = await createProject(page, 'PW-CHANGE-DEFAULT', 'Complex')
  const versionOne = await createVersion(page, projectId, '1.0.0', 'Incremental')
  const versionTwo = await createVersion(page, projectId, '2.0.0', 'Incremental')
  await createImage(page, projectId, versionOne, 'nginx')
  await createImage(page, projectId, versionTwo, 'redis')

  await page.goto(projectUrl(projectId))

  await page.locator('img[src="/home_bold.svg"]:below(h5:has-text("2.0.0"))').first().click()

  await page.waitForSelector('button:has-text("Confirm")')
  await page.locator('button:has-text("Confirm")').click()

  await expect(page.locator(`div.bg-error-red:has-text("DEFAULT"):left-of(h5:has-text("2.0.0"))`)).toHaveCount(0)
  await expect(page.locator(`div.bg-error-red:has-text("DEFAULT"):right-of(h5:has-text("2.0.0"))`)).toHaveCount(1)

  const versionThree = await createVersion(page, projectId, '3.0.0', 'Incremental')
  await page.goto(versionUrl(projectId, versionThree, { section: 'images' }))

  const imagesTableBody = await page.locator('.table-row-group')
  const imagesRows = await imagesTableBody.locator('.table-row')

  await expect(imagesRows).toHaveCount(1)
  await expect(await page.locator('div.table-cell:has-text("redis")').first()).toBeVisible()
  await expect(await page.locator('div.table-cell:has-text("nginx")')).toHaveCount(0)
})

test('Increase version should work', async ({ page }) => {
  const projectId = await createProject(page, 'PW-INCREASE-VERSION', 'Complex')
  const versionOne = await createVersion(page, projectId, '1.0.0', 'Incremental')
  await createImage(page, projectId, versionOne, 'nginx')
  await addDeploymentToVersion(page, projectId, versionOne, DAGENT_NODE)

  await page.goto(projectUrl(projectId))

  await page.locator('img[src="/arrow_up_bold.svg"]:below(h5:has-text("1.0.0"))').first().click()

  await page.waitForSelector('h4:has-text("Increase 1.0.0")')
  await page.locator('input[name=name]').fill('2.0.0')

  await page.locator('button:has-text("Save")').click()
  await page.waitForURL(`${projectUrl(projectId)}/versions/**`)

  const imagesTableBody = await page.locator('.table-row-group')
  const imagesRows = await imagesTableBody.locator('.table-row')

  await expect(imagesRows).toHaveCount(1)
  await expect(await page.locator('div.table-cell:has-text("nginx")').first()).toBeVisible()

  const deploymentsTableBody = await page.locator('.table-row-group')
  const deploymentsRow = await deploymentsTableBody.locator('.table-row')

  await expect(deploymentsRow).toHaveCount(1)
})
