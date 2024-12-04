import { WS_TYPE_PATCH_CONFIG } from '@app/models'
import { expect, Page } from '@playwright/test'
import { NGINX_TEST_IMAGE_WITH_TAG, screenshotPath, TEAM_ROUTES } from '../utils/common'
import { createImage, createProject, createVersion } from '../utils/projects'
import { test } from '../utils/test.fixture'
import { waitSocketRef, wsPatchSent } from '../utils/websocket'

const setup = async (
  page: Page,
  projectName: string,
  versionName: string,
  imageName: string,
): Promise<{ projectId: string; versionId: string; imageConfigId: string }> => {
  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Incremental')
  const imageConfigId = await createImage(page, projectId, versionId, imageName)

  return {
    projectId,
    versionId,
    imageConfigId,
  }
}

test.describe('View state', () => {
  test('Editor state should show the configuration fields', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'editor-state-conf', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')

    const editorButton = await page.waitForSelector('button:has-text("Editor")')
    await editorButton.click()

    const selector = await page.locator('label:has-text("Filters")').first()

    await page.screenshot({ path: screenshotPath('image-config-editor'), fullPage: true })

    await expect(selector).toBeVisible()
  })

  test('JSON state should show the json editor', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'editor-state-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    await page.screenshot({ path: screenshotPath('image-config-json'), fullPage: true })

    const jsonContainer = await page.locator('textarea')
    await expect(jsonContainer).toBeVisible()
  })
})

test.describe('Filters', () => {
  test('None should be selected by default', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'filter-all', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')

    const allButton = await page.locator('button:has-text("All")')

    await expect(allButton).toHaveClass(/border-dyo-turquoise/)
    await expect(allButton).not.toHaveClass(/bg-dyo-turquoise/)
  })

  test('All should not be selected if one of the main filters are not selected', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'filter-select', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')

    await page.locator(`button:has-text("Common")`).first().click()

    const allButton = await page.locator('button:has-text("All")')

    await expect(allButton).not.toHaveClass(/bg-dyo-turquoise/)
  })

  test('Main filter should not be selected if one of its sub filters are not selected', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'sub-filter', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')

    const subFilter = await page.locator(`button:has-text("Network mode")`)
    await subFilter.click()

    const mainFilter = await page.locator(`button:has-text("Docker")`).first()

    await expect(mainFilter).not.toHaveClass(/bg-/)
  })

  test('Config field should be invisible if its sub filter is not selected', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'sub-deselect', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')

    const subFilter = await page.locator(`button:has-text("Deployment strategy")`)
    await subFilter.click()

    const configField = await page.locator(`label:has-text("Kubernetes")`)

    await expect(configField).toHaveCount(0)
  })
})

const wsPatchMatchPorts = (internalPort: string, externalPort?: string) => (payload: any) => {
  const internal = Number.parseInt(internalPort, 10)
  const external = Number.parseInt(externalPort, 10)

  return payload.config?.ports?.some(it => it.internal === internal && (!external || it.external === external))
}

test.describe('Image configurations', () => {
  test('Port should be saved after adding it from the config field', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'port-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Ports")').click()

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG)
    const addPortsButton = await page.locator(`[src="/plus.svg"]:right-of(label:has-text("Ports"))`).first()
    await addPortsButton.click()
    await wsSent

    const internal = '1000'
    const external = '2000'

    const internalInput = page.locator('input[placeholder="Internal"]')
    const externalInput = page.locator('input[placeholder="External"]')

    wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchPorts(internal, external))
    await internalInput.type(internal)
    await externalInput.type(external)
    await wsSent

    await page.reload()

    await expect(internalInput).toHaveValue(internal)
    await expect(externalInput).toHaveValue(external)
  })

  test('Port should be saved after adding it from the json editor', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'port-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const internalAsNumber = 2000
    const externalAsNumber = 4000
    const internal = internalAsNumber.toString()
    const external = externalAsNumber.toString()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.ports = [{ internal: internalAsNumber, external: externalAsNumber }]

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchPorts(internal, external))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const internalInput = page.locator('input[placeholder="Internal"]')
    const externalInput = page.locator('input[placeholder="External"]')

    await expect(internalInput).toHaveValue(internal)
    await expect(externalInput).toHaveValue(external)
  })
})
