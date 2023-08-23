import { expect, Page, test } from '@playwright/test'
import { TEAM_ROUTES } from 'e2e/utils/common'
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

test.describe.configure({ mode: 'parallel' })

test.describe('Image docker config from JSON', () => {
  test('Network mode should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'networkmode-json', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const mode = 'host'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.networkMode = mode

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_IMAGE, wsPatchMatchNetworkMode(mode))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(
      page.locator(`div.grid:has(label:has-text("NETWORK MODE")) button.bg-dyo-turquoise:has-text("${mode}")`),
    ).toBeVisible()
  })

  test('Docker labels should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'dockerlabel-json', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const key = 'docker-key'
    const value = 'docker-value'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.dockerLabels = { [key]: value }

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_IMAGE, wsPatchMatchDockerLabel(key, value))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(
      page.locator('div.grid:has(label:has-text("DOCKER LABELS")) input[placeholder="Key"]').first(),
    ).toHaveValue(key)
    await expect(
      page.locator('div.grid:has(label:has-text("DOCKER LABELS")) input[placeholder="Value"]').first(),
    ).toHaveValue(value)
  })

  test('Restart policy should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'restartpolicy-json', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.restartPolicy = 'always'

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_IMAGE, wsPatchMatchRestartPolicy('always'))
    jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(
      page.locator('div.grid:has(label:has-text("RESTART POLICY")) button.bg-dyo-turquoise:has-text("Always")'),
    ).toBeVisible()
  })

  test('Log config should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'logconfig-json', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const type = 'json-file'
    const key = 'logger-key'
    const value = 'logger-value'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.logConfig = { driver: type, options: { [key]: value } }

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_IMAGE, wsPatchMatchLogConfig(type, key, value))
    jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const loggerConf = page.locator('div.grid:has(label:has-text("LOG CONFIG"))')
    await expect(loggerConf.locator(`button.bg-dyo-turquoise:has-text("${type}")`)).toBeVisible()
    await expect(loggerConf.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(loggerConf.locator('input[placeholder="Value"]').first()).toHaveValue(value)
  })

  test('Networks should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'networks-json', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    await page.locator('button:has-text("Networks")').click()

    const network = '10.16.128.196'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.networks = [network]

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_IMAGE, wsPatchMatchNetwork(network))
    jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(
      page.locator('div.grid:has(label:has-text("NETWORKS")) input[placeholder="Network"]').first(),
    ).toHaveValue(network)
  })
})
