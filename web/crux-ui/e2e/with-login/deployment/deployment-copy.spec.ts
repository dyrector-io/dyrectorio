import { WS_TYPE_PATCH_IMAGE, WS_TYPE_PATCH_INSTANCE } from '@app/models'
import { Page, expect } from '@playwright/test'
import { wsPatchMatchEverySecret, wsPatchMatchNonNullSecretValues } from 'e2e/utils/websocket-match'
import { DAGENT_NODE, NGINX_TEST_IMAGE_WITH_TAG, TEAM_ROUTES, waitForURLExcept } from '../../utils/common'
import { createNode } from '../../utils/nodes'
import {
  addDeploymentToVersion,
  createImage,
  createProject,
  createVersion,
  fillDeploymentPrefix,
} from '../../utils/projects'
import { hookTestPageEvents, test } from '../../utils/test.fixture'
import { waitSocketRef, wsPatchSent } from '../../utils/websocket'

const addSecretToImage = async (
  page: Page,
  projectId: string,
  versionId: string,
  imageId: string,
  secretKeys: string[],
): Promise<void> => {
  const sock = waitSocketRef(page)
  await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
  await page.waitForSelector('h2:text-is("Image")')
  const ws = await sock
  const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

  const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
  await jsonEditorButton.click()

  const jsonEditor = await page.locator('textarea')
  const json = JSON.parse(await jsonEditor.inputValue())
  json.secrets = secretKeys.map(key => ({ key, required: false }))

  const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_IMAGE, wsPatchMatchEverySecret(secretKeys))
  await jsonEditor.fill(JSON.stringify(json))
  await wsSent
}

const openContainerConfigByDeploymentTable = async (page: Page, containerName: string): Promise<void> => {
  const instanceRows = await page.locator('table.w-full >> tbody >> tr')
  await expect(instanceRows).toHaveCount(1)

  await expect(page.locator(`td:has-text("${containerName}")`).first()).toBeVisible()
  const containerSettingsButton = await page.waitForSelector(
    `[src="/concrete_container_config.svg"]:right-of(:text("${containerName}"))`,
  )
  await containerSettingsButton.click()

  await page.waitForSelector(`h2:has-text("Container")`)
}

test.describe('Deployment Copy', () => {
  const projectName = 'depl-cpy'
  const newNodeName = projectName
  const originalPrefix = `dcpy`

  let originalDeploymentId: string
  const secretKeys = ['secretOne', 'secretTwo']
  const newSecretKey = 'new-secret'
  const newSecretKeyList = [...secretKeys, newSecretKey]

  // NOTE(@robot9706): beforeAll runs on each worker, so if tests are running in parallel beforeAll executes multiple times
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }, testInfo) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    hookTestPageEvents(page, testInfo)

    const projectId = await createProject(page, projectName, 'versioned')
    await createNode(page, newNodeName)

    const versionId = await createVersion(page, projectId, '0.1.0', 'Incremental')
    const imageId = await createImage(page, projectId, versionId, NGINX_TEST_IMAGE_WITH_TAG)

    await addSecretToImage(page, projectId, versionId, imageId, secretKeys)

    const { id: deploymentId } = await addDeploymentToVersion(page, projectId, versionId, DAGENT_NODE, {
      prefix: originalPrefix,
    })
    originalDeploymentId = deploymentId

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.deployment.details(originalDeploymentId))
    await page.waitForSelector('h2:text-is("Deployments")')
    const ws = await sock

    await openContainerConfigByDeploymentTable(page, 'nginx')

    const newSecretValue = 'new-secret-value'

    const newSecertKeyInput = page.locator('input[placeholder="Key"][value=""]:below(label:has-text("SECRETS"))')
    await newSecertKeyInput.fill(newSecretKey)

    const newSecretValueInput = page.locator(
      `input[placeholder="Value"][value=""]:near(input[placeholder="Key"][value="${newSecretKey}"], 10)`,
    )
    await newSecretValueInput.fill(newSecretValue)

    const wsRoute = TEAM_ROUTES.deployment.detailsSocket(originalDeploymentId)
    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_INSTANCE, wsPatchMatchNonNullSecretValues(newSecretKeyList))
    await page.locator(`button:has-text("Save"):below(input[value="${newSecretValue}"])`).click()
    await wsSent

    await page.close()
    await ctx.close()
  })

  test('should copy secret values to the same node', async ({ page }) => {
    await page.goto(TEAM_ROUTES.deployment.details(originalDeploymentId))
    await page.waitForSelector('h2:text-is("Deployments")')

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    const newPrefix = 'dcpy-second'
    await page.locator(`button:has-text("${DAGENT_NODE}")`).click()
    await fillDeploymentPrefix(page, newPrefix)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${TEAM_ROUTES.deployment.list()}/`, except: currentUrl })
    await page.waitForSelector('h2:text-is("Deployments")')

    await expect(page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)

    await openContainerConfigByDeploymentTable(page, 'nginx')

    const newSecretValueInput = page.locator(
      `input[placeholder="Value"]:near(input[placeholder="Key"][value="${newSecretKey}"], 10)`,
    )

    await expect(newSecretValueInput).toBeDisabled()
    await expect(newSecretValueInput).toHaveValue(/^(?!\s*$).+/) // match anything but an empty string
  })

  test('should delete secret values to a different node', async ({ page }) => {
    await page.goto(TEAM_ROUTES.deployment.details(originalDeploymentId))
    await page.waitForSelector('h2:text-is("Deployments")')

    const copyButton = page.locator('button:has-text("Copy")')
    await copyButton.click()

    await page.locator(`button:has-text("${newNodeName}")`).click()
    await fillDeploymentPrefix(page, originalPrefix)

    const currentUrl = page.url()
    await page.locator('button:has-text("Copy")').click()
    await waitForURLExcept(page, { startsWith: `${TEAM_ROUTES.deployment.list()}/`, except: currentUrl })
    await page.waitForSelector('h2:text-is("Deployments")')

    await expect(page.locator('.bg-dyo-turquoise:has-text("Preparing")')).toHaveCount(1)

    await openContainerConfigByDeploymentTable(page, 'nginx')

    const newSecretKeyInput = page.locator(`input[placeholder="Key"][value="${newSecretKey}"]`)

    await expect(await newSecretKeyInput.count()).toEqual(0)
  })
})
