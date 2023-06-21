import { deploymentUrl, deploymentWsUrl, imageConfigUrl, projectUrl, versionUrl, versionWsUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { DAGENT_NODE, NGINX_TEST_IMAGE_WITH_TAG } from 'e2e/utils/common'
import { addPortsToContainerConfig } from 'e2e/utils/container-config'
import {
  addDeploymentToVersion,
  addImageToVersion,
  createImage,
  createProject,
  createVersion,
  deleteDeployment,
  deleteVersion,
  fillDeploymentPrefix,
} from 'e2e/utils/projects'
import { waitSocket } from 'e2e/utils/websocket'

test.describe('Deleting default version', () => {
  test('should not affect images of a new version', async ({ page }) => {
    const projectName = 'delete-default-check-images'

    const projectId = await createProject(page, projectName, 'versioned')
    const defaultVersionName = 'default-version'
    const defaultVersionId = await createVersion(page, projectId, defaultVersionName, 'Rolling')
    await addImageToVersion(page, projectId, defaultVersionId, NGINX_TEST_IMAGE_WITH_TAG)

    const newVersionId = await createVersion(page, projectId, 'new-version', 'Rolling')

    await deleteVersion(page, projectId, defaultVersionId)

    await page.goto(projectUrl(projectId))

    expect(page.locator(`:has-text("${defaultVersionName}")`)).toHaveCount(0)

    await page.goto(versionUrl(projectId, newVersionId))

    const imagesTableBody = await page.locator('.table-row-group')
    const imagesRows = await imagesTableBody.locator('.table-row')

    await expect(imagesRows).toHaveCount(1)
    await expect(page.locator('div.table-cell:has-text("nginx")').first()).toBeVisible()
  })

  test('should not affect the image config of a new version', async ({ page }) => {
    const projectName = 'delete-default-check-image-config'

    const projectId = await createProject(page, projectName, 'versioned')
    const defaultVersionName = 'default-version'
    const defaultVersionId = await createVersion(page, projectId, defaultVersionName, 'Rolling')
    const defaultVersionImageId = await createImage(page, projectId, defaultVersionId, NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, defaultVersionId, defaultVersionImageId))
    const ws = await sock
    const wsRoute = versionWsUrl(defaultVersionId)

    const internal = '1000'
    const external = '2000'
    await addPortsToContainerConfig(page, ws, wsRoute, internal, external)

    const newVersionId = await createVersion(page, projectId, 'new-version', 'Rolling')

    await deleteVersion(page, projectId, defaultVersionId)

    await page.goto(projectUrl(projectId))

    expect(page.locator(`:has-text("${defaultVersionName}")`)).toHaveCount(0)

    await page.goto(versionUrl(projectId, newVersionId))

    const imagesTableBody = await page.locator('.table-row-group')
    const imagesRows = await imagesTableBody.locator('.table-row')

    await expect(imagesRows).toHaveCount(1)
    await expect(page.locator('div.table-cell:has-text("nginx")').first()).toBeVisible()

    const settingsButton = await page.waitForSelector(`[src="/settings.svg"]:right-of(:text("nginx"))`)
    await settingsButton.click()

    await page.waitForSelector(`h2:has-text("Image")`)

    const internalInput = page.locator('input[placeholder="Internal"]')
    const externalInput = page.locator('input[placeholder="External"]')

    await expect(internalInput).toHaveValue(internal)
    await expect(externalInput).toHaveValue(external)
  })

  test('should not affect the deployments of a new version', async ({ page }) => {
    const projectName = 'delete-default-check-deployment'
    const prefix = projectName

    const projectId = await createProject(page, projectName, 'versioned')
    const defaultVersionName = 'default-version'
    const defaultVersionId = await createVersion(page, projectId, defaultVersionName, 'Rolling')
    await addImageToVersion(page, projectId, defaultVersionId, NGINX_TEST_IMAGE_WITH_TAG)
    await addDeploymentToVersion(page, projectId, defaultVersionId, DAGENT_NODE, prefix)

    const newVersionId = await createVersion(page, projectId, 'new-version', 'Rolling')

    await page.goto(versionUrl(projectId, defaultVersionId))

    await deleteVersion(page, projectId, defaultVersionId)

    await page.goto(projectUrl(projectId))

    expect(page.locator(`:has-text("${defaultVersionName}")`)).toHaveCount(0)

    await page.goto(versionUrl(projectId, newVersionId))

    await page.locator('button:has-text("Deployments")').click()

    const deploymentsTabelBody = await page.locator('.table-row-group')
    const deploymentRows = await deploymentsTabelBody.locator('.table-row')

    await expect(deploymentRows).toHaveCount(1)
    await expect(page.locator(`div.table-cell:has-text("${prefix}")`)).toBeVisible()
  })

  test('should not affect the instances of the deployment of a new version', async ({ page }) => {
    const projectName = 'delete-default-check-instances'
    const prefix = projectName

    const projectId = await createProject(page, projectName, 'versioned')
    const defaultVersionName = 'default-version'
    const defaultVersionId = await createVersion(page, projectId, defaultVersionName, 'Rolling')
    await addImageToVersion(page, projectId, defaultVersionId, NGINX_TEST_IMAGE_WITH_TAG)
    await addDeploymentToVersion(page, projectId, defaultVersionId, DAGENT_NODE, prefix)

    const newVersionId = await createVersion(page, projectId, 'new-version', 'Rolling')

    await page.goto(versionUrl(projectId, defaultVersionId))

    await deleteVersion(page, projectId, defaultVersionId)

    await page.goto(projectUrl(projectId))

    expect(page.locator(`:has-text("${defaultVersionName}")`)).toHaveCount(0)

    await page.goto(versionUrl(projectId, newVersionId))

    await page.locator('button:has-text("Deployments")').click()

    const deploymentsTabelBody = await page.locator('.table-row-group')
    const deploymentRows = await deploymentsTabelBody.locator('.table-row')

    await expect(deploymentRows).toHaveCount(1)

    const viewDeploymentButton = await page.waitForSelector(`[src="/eye.svg"]`)
    await viewDeploymentButton.click()

    const instancesTabelBody = await page.locator('.table-row-group')
    const instanceRows = await instancesTabelBody.locator('.table-row')
    await expect(instanceRows).toHaveCount(1)
  })

  test('should not affect the instance config of the deployment of a new version', async ({ page }) => {
    const projectName = 'delete-default-check-instance-config'
    const prefix = projectName

    const projectId = await createProject(page, projectName, 'versioned')
    const defaultVersionName = 'default-version'
    const defaultVersionId = await createVersion(page, projectId, defaultVersionName, 'Rolling')
    await addImageToVersion(page, projectId, defaultVersionId, NGINX_TEST_IMAGE_WITH_TAG)
    const { id: defaultDeploymentId } = await addDeploymentToVersion(
      page,
      projectId,
      defaultVersionId,
      DAGENT_NODE,
      prefix,
    )

    await page.goto(deploymentUrl(defaultDeploymentId))

    const instancesTableBody = await page.locator('.table-row-group')
    const instancesRows = await instancesTableBody.locator('.table-row')

    await expect(instancesRows).toHaveCount(1)
    await expect(page.locator('div.table-cell:has-text("nginx")').first()).toBeVisible()

    const settingsButton = await page.waitForSelector(`[src="/settings.svg"]:right-of(:text("nginx"))`)
    await settingsButton.click()

    const sock = waitSocket(page)
    await page.waitForSelector(`h2:has-text("Container")`)
    const ws = await sock
    const wsRoute = deploymentWsUrl(defaultDeploymentId)

    const internal = '1000'
    const external = '2000'
    await addPortsToContainerConfig(page, ws, wsRoute, internal, external)

    const newVersionId = await createVersion(page, projectId, 'new-version', 'Rolling')

    await page.goto(versionUrl(projectId, defaultVersionId))

    await deleteVersion(page, projectId, defaultVersionId)

    await page.goto(projectUrl(projectId))

    expect(page.locator(`:has-text("${defaultVersionName}")`)).toHaveCount(0)

    await page.goto(versionUrl(projectId, newVersionId))

    await page.locator('button:has-text("Deployments")').click()

    const deploymentsTabelBody = await page.locator('.table-row-group')
    const deploymentRows = await deploymentsTabelBody.locator('.table-row')

    await expect(deploymentRows).toHaveCount(1)

    const viewDeploymentButton = await page.waitForSelector(`[src="/eye.svg"]`)
    await viewDeploymentButton.click()

    const instancesTabelBody = await page.locator('.table-row-group')
    const instanceRows = await instancesTabelBody.locator('.table-row')
    await expect(instanceRows).toHaveCount(1)

    await expect(page.locator('div.table-cell:has-text("nginx")').first()).toBeVisible()
    const newVersionDeploymentSettingsButton = await page.waitForSelector(
      `[src="/settings.svg"]:right-of(:text("nginx"))`,
    )
    await newVersionDeploymentSettingsButton.click()

    await page.waitForSelector(`h2:has-text("Container")`)

    const internalInput = page.locator('input[placeholder="Internal"]')
    const externalInput = page.locator('input[placeholder="External"]')

    await expect(internalInput).toHaveValue(internal)
    await expect(externalInput).toHaveValue(external)
  })
})

test.describe("Deleting copied deployment's parent", () => {
  test('should not affect the instances of the child deployment', async ({ page }) => {
    const projectName = 'delete-parent-deploy-instances'
    const prefix = projectName

    const projectId = await createProject(page, projectName, 'versioned')
    const versionName = 'version'
    const versionId = await createVersion(page, projectId, versionName, 'Rolling')
    await addImageToVersion(page, projectId, versionId, NGINX_TEST_IMAGE_WITH_TAG)
    const { id: parentDeploymentId } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE, prefix)

    await page.goto(deploymentUrl(parentDeploymentId))

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${DAGENT_NODE}")`).click()
    await fillDeploymentPrefix(page, `${prefix}-other`)

    await page.locator('button:has-text("Copy")').click()

    await deleteDeployment(page, parentDeploymentId)

    await page.goto(versionUrl(projectId, versionId))

    await page.locator('button:has-text("Deployments")').click()

    const deploymentsTabelBody = await page.locator('.table-row-group')
    const deploymentRows = await deploymentsTabelBody.locator('.table-row')

    await expect(deploymentRows).toHaveCount(1)

    const viewDeploymentButton = await page.waitForSelector(`[src="/eye.svg"]`)
    await viewDeploymentButton.click()

    const instancesTabelBody = await page.locator('.table-row-group')
    const instanceRows = await instancesTabelBody.locator('.table-row')
    await expect(instanceRows).toHaveCount(1)
  })

  test('should not affect the instance config of the child deployment', async ({ page }) => {
    const projectName = 'delete-parent-deploy-instance-config'
    const prefix = projectName

    const projectId = await createProject(page, projectName, 'versioned')
    const versionName = 'version'
    const versionId = await createVersion(page, projectId, versionName, 'Rolling')
    await addImageToVersion(page, projectId, versionId, NGINX_TEST_IMAGE_WITH_TAG)
    const { id: parentDeploymentId } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE, prefix)

    await page.goto(deploymentUrl(parentDeploymentId))

    const instancesTableBody = await page.locator('.table-row-group')
    const instancesRows = await instancesTableBody.locator('.table-row')

    await expect(instancesRows).toHaveCount(1)
    await expect(page.locator('div.table-cell:has-text("nginx")').first()).toBeVisible()

    const settingsButton = await page.waitForSelector(`[src="/settings.svg"]:right-of(:text("nginx"))`)
    await settingsButton.click()

    const sock = waitSocket(page)
    await page.waitForSelector(`h2:has-text("Container")`)
    const ws = await sock
    const wsRoute = deploymentWsUrl(parentDeploymentId)

    const internal = '1000'
    const external = '2000'
    await addPortsToContainerConfig(page, ws, wsRoute, internal, external)

    await page.goto(deploymentUrl(parentDeploymentId))

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${DAGENT_NODE}")`).click()
    await fillDeploymentPrefix(page, `${prefix}-other`)

    await page.locator('button:has-text("Copy")').click()

    await deleteDeployment(page, parentDeploymentId)

    await page.goto(versionUrl(projectId, versionId))

    await page.locator('button:has-text("Deployments")').click()

    const deploymentsTabelBody = await page.locator('.table-row-group')
    const deploymentRows = await deploymentsTabelBody.locator('.table-row')

    await expect(deploymentRows).toHaveCount(1)

    const viewDeploymentButton = await page.waitForSelector(`[src="/eye.svg"]`)
    await viewDeploymentButton.click()

    const instancesTabelBody = await page.locator('.table-row-group')
    const instanceRows = await instancesTabelBody.locator('.table-row')
    await expect(instanceRows).toHaveCount(1)

    await expect(page.locator('div.table-cell:has-text("nginx")').first()).toBeVisible()
    const newDeploymentSettingsButton = await page.waitForSelector(`[src="/settings.svg"]:right-of(:text("nginx"))`)
    await newDeploymentSettingsButton.click()

    await page.waitForSelector(`h2:has-text("Container")`)

    const internalInput = page.locator('input[placeholder="Internal"]')
    const externalInput = page.locator('input[placeholder="External"]')

    await expect(internalInput).toHaveValue(internal)
    await expect(externalInput).toHaveValue(external)
  })
})
