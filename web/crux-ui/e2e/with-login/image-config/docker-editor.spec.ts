import { imageConfigUrl, versionWsUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { waitSocket, wsPatchSent } from 'e2e/utils/websocket'
import {
  wsPatchMatchDockerLabel,
  wsPatchMatchLogConfig,
  wsPatchMatchNetwork,
  wsPatchMatchNetworkMode,
  wsPatchMatchRestartPolicy,
} from 'e2e/utils/websocket-match'
import { createImage, createProject, createVersion } from '../../utils/projects'
import { WS_TYPE_PATCH_IMAGE } from '@app/models'

const setup = async (
  page: Page,
  projectName: string,
  versionName: string,
  imageName: string,
): Promise<{ projectId: string; versionId: string; imageId: string }> => {
  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Incremental')
  const imageId = await createImage(page, projectId, versionId, imageName)

  return { projectId, versionId, imageId }
}

test.describe('Image docker config from editor', () => {
  test('Network mode should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'networkmode-editor', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    const mode = 'host'

    let wsSent = wsPatchSent(ws, wsRoute,WS_TYPE_PATCH_IMAGE, wsPatchMatchNetworkMode(mode))
    await page.locator(`div.grid:has(label:has-text("NETWORK MODE")) button:has-text("${mode}")`).click()
    await wsSent

    await page.reload()

    await expect(
      page.locator(`div.grid:has(label:has-text("NETWORK MODE")) button.bg-dyo-turquoise:has-text("${mode}")`),
    ).toBeVisible()
  })

  test('Docker labels should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'dockerlabel-editor', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    const key = 'docker-key'
    const value = 'docker-value'
    const keyInput = page.locator('div.grid:has(label:has-text("DOCKER LABELS")) input[placeholder="Key"]').first()
    const valueInput = page.locator('div.grid:has(label:has-text("DOCKER LABELS")) input[placeholder="Value"]').first()

    await page.locator('button:has-text("Docker labels")').click()

    let wsSent = wsPatchSent(ws, wsRoute,WS_TYPE_PATCH_IMAGE, wsPatchMatchDockerLabel(key, value))
    await keyInput.fill(key)
    await valueInput.fill(value)
    await wsSent

    await page.reload()

    await expect(keyInput).toHaveValue(key)
    await expect(valueInput).toHaveValue(value)
  })

  test('Restart policy should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'restartpolicy-editor', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    let wsSent = wsPatchSent(ws, wsRoute,WS_TYPE_PATCH_IMAGE, wsPatchMatchRestartPolicy('always'))
    page.locator('div.grid:has(label:has-text("RESTART POLICY")) button:has-text("Always")').click()
    await wsSent

    await page.reload()

    await expect(
      page.locator('div.grid:has(label:has-text("RESTART POLICY")) button.bg-dyo-turquoise:has-text("Always")'),
    ).toBeVisible()
  })

  test('Log config should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'logconfig-editor', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    await page.locator('button:has-text("Log config")').click()

    const type = 'json-file'
    const key = 'logger-key'
    const value = 'logger-value'

    const loggerConf = page.locator('div.grid:has(label:has-text("LOG CONFIG"))')

    let wsSent = wsPatchSent(ws, wsRoute,WS_TYPE_PATCH_IMAGE, wsPatchMatchLogConfig(type, key, value))
    await loggerConf.locator('input[placeholder="Key"]').first().fill(key)
    await loggerConf.locator('input[placeholder="Value"]').first().fill(value)
    await loggerConf.locator(`button:has-text("${type}")`).click()
    await wsSent

    await page.reload()

    await expect(loggerConf.locator(`button.bg-dyo-turquoise:has-text("${type}")`)).toBeVisible()
    await expect(loggerConf.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(loggerConf.locator('input[placeholder="Value"]').first()).toHaveValue(value)
  })

  test('Networks should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'networks-editor', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    await page.locator('button:has-text("Networks")').click()

    const network = '10.16.128.196'

    let wsSent = wsPatchSent(ws, wsRoute,WS_TYPE_PATCH_IMAGE, wsPatchMatchNetwork(network))
    page.locator('div.grid:has(label:has-text("NETWORKS")) input[placeholder="Network"]').first().fill(network)
    await wsSent

    await page.reload()

    await expect(
      page.locator('div.grid:has(label:has-text("NETWORKS")) input[placeholder="Network"]').first(),
    ).toHaveValue(network)
  })
})
