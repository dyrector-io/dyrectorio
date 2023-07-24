import { imageConfigUrl, versionWsUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
import { createImage, createProject, createVersion } from '../../utils/projects'
import { waitSocket, wsPatchSent } from '../../utils/websocket'

const setup = async (
  page: Page,
  projectName: string,
  versionName: string,
  imageName: string,
): Promise<{ projectId: string; versionId: string; imageId: string }> => {
  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Incremental')
  const imageId = await createImage(page, projectId, versionId, imageName)

  return {
    projectId,
    versionId,
    imageId,
  }
}

const wsPatchMatchPorts = (internalPort: string, externalPort?: string) => (payload: any) => {
  const internal = Number.parseInt(internalPort, 10)
  const external = Number.parseInt(externalPort, 10)

  return payload.config?.ports?.some(it => it.internal === internal && (!external || it.external === external))
}

test.describe('Image configurations', () => {
  test('Port should be saved after adding it from the config field', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'port-editor', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    await page.locator('button:has-text("Ports")').click()

    let wsSent = wsPatchSent(ws, wsRoute)
    const addPortsButton = await page.locator(`[src="/plus.svg"]:right-of(label:has-text("Ports"))`).first()
    await addPortsButton.click()
    await wsSent

    const internal = '1000'
    const external = '2000'

    const internalInput = page.locator('input[placeholder="Internal"]')
    const externalInput = page.locator('input[placeholder="External"]')

    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchPorts(internal, external))
    await internalInput.type(internal)
    await externalInput.type(external)
    await wsSent

    await page.reload()

    await expect(internalInput).toHaveValue(internal)
    await expect(externalInput).toHaveValue(external)
  })

  test('Port should be saved after adding it from the json editor', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'port-json', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const internalAsNumber = 2000
    const externalAsNumber = 4000
    const internal = internalAsNumber.toString()
    const external = externalAsNumber.toString()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.ports = [{ internal: internalAsNumber, external: externalAsNumber }]

    const wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchPorts(internal, external))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const internalInput = page.locator('input[placeholder="Internal"]')
    const externalInput = page.locator('input[placeholder="External"]')

    await expect(internalInput).toHaveValue(internal)
    await expect(externalInput).toHaveValue(external)
  })
})
