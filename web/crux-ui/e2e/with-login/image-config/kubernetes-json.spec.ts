import { expect, Page, test } from '@playwright/test'
import { TEAM_ROUTES } from 'e2e/utils/common'
import {
  wsPatchMatchCustomHeader,
  wsPatchMatchDeploymentAnnotations,
  wsPatchMatchDeploymentLabel,
  wsPatchMatchDeploymentStrategy,
  wsPatchMatchHealthCheck,
  wsPatchMatchIngressAnnotations,
  wsPatchMatchIngressLabel,
  wsPatchMatchLBAnnotations,
  wsPatchMatchLoadBalancer,
  wsPatchMatchProxyHeader,
  wsPatchMatchResourceConfig,
  wsPatchMatchServiceAnnotations,
  wsPatchMatchServiceLabel,
} from 'e2e/utils/websocket-match'
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

  return { projectId, versionId, imageId }
}

test.describe('Image kubernetes config from JSON', () => {
  test('Deployment strategy should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'deployment-strategy-json', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const strategy = 'rolling'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.deploymentStrategy = strategy

    const wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchDeploymentStrategy(strategy))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.locator(`button.bg-dyo-turquoise:has-text("${strategy}")`)).toBeVisible()
  })

  test('Custom headers should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'custom-headers-json', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const header = 'test-header'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.customHeaders = [header]

    const wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchCustomHeader(header))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const input = page
      .locator('div.grid:has(label:has-text("CUSTOM HEADERS")) input[placeholder="Header name"]')
      .first()
    await expect(input).toHaveValue(header)
  })

  test('Proxy headers should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'proxy-headers-json', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.proxyHeaders = true

    const wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchProxyHeader(true))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.locator('button[aria-checked="true"]:right-of(label:has-text("PROXY HEADERS"))')).toBeVisible()
  })

  test('Load balancer should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'load-balancer-json', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const key = 'balancer-key'
    const value = 'balancer-value'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.useLoadBalancer = true

    let wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchLoadBalancer(true))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent
    json.extraLBAnnotations = { [key]: value }
    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchLBAnnotations(key, value))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(
      page.locator('button[aria-checked="true"]:right-of(label:has-text("USE LOAD BALANCER"))'),
    ).toBeVisible()
    await expect(
      page.locator('div.grid:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Key"]').first(),
    ).toHaveValue(key)
    await expect(
      page.locator('div.grid:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Value"]').first(),
    ).toHaveValue(value)
  })

  test('Health check config should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'health-check-json', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const port = 12560
    const liveness = 'test/liveness/'
    const readiness = 'test/readiness/'
    const startup = 'test/startup/'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.healthCheckConfig = { port, livenessProbe: liveness, readinessProbe: readiness, startupProbe: startup }

    const wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchHealthCheck(port, liveness, readiness, startup))
    jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const hcConf = page.locator('div.grid:has(label:has-text("HEALTH CHECK CONFIG"))')
    await expect(hcConf.locator('input[placeholder="Port"]')).toHaveValue(port.toString())
    await expect(hcConf.getByLabel('Liveness probe')).toHaveValue(liveness)
    await expect(hcConf.getByLabel('Readiness probe')).toHaveValue(readiness)
    await expect(hcConf.getByLabel('Startup probe')).toHaveValue(startup)
  })

  test('Resource config should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'resource-config-json', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const cpuLimits = '50'
    const cpuRequests = '25'
    const memoryLimits = '1m'
    const memoryRequests = '2m'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.resourceConfig = {
      limits: { cpu: cpuLimits, memory: memoryLimits },
      requests: { cpu: cpuRequests, memory: memoryRequests },
    }

    const wsSent = wsPatchSent(
      ws,
      wsRoute,
      wsPatchMatchResourceConfig(cpuLimits, cpuRequests, memoryLimits, memoryRequests),
    )
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const rsConf = page.locator('div.grid:has(label:has-text("RESOURCE CONFIG"))')
    await expect(rsConf.locator('input').nth(0)).toHaveValue(cpuLimits)
    await expect(rsConf.locator('input').nth(1)).toHaveValue(memoryLimits)
    await expect(rsConf.locator('input').nth(2)).toHaveValue(cpuRequests)
    await expect(rsConf.locator('input').nth(3)).toHaveValue(memoryRequests)
  })

  const getCategoryDiv = async (category: string, page: Page) =>
    page.locator(`div.max-h-128 > div:nth-child(2):near(label:has-text("${category}"))`)

  test('Labels should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'labels-json', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const key = 'label-key'
    const value = 'label-value'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())

    let wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchDeploymentLabel(key, value))
    json.labels = { deployment: { [key]: value } }
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchServiceLabel(key, value))
    json.labels = { deployment: { [key]: value }, service: { [key]: value } }
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchIngressLabel(key, value))
    json.labels = { deployment: { [key]: value }, service: { [key]: value }, ingress: { [key]: value } }
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const deploymentDiv = await getCategoryDiv('Deployment', page)
    const serviceDiv = await getCategoryDiv('Service', page)
    const ingressDiv = await getCategoryDiv('Ingress', page)
    await expect(deploymentDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(deploymentDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
    await expect(serviceDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(serviceDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
    await expect(ingressDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(ingressDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
  })

  test('Annotations should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'annotations-json', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(TEAM_ROUTES.project.versions(projectId).imageDetails(versionId, imageId))
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const key = 'annotation-key'
    const value = 'annotation-value'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())

    let wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchDeploymentAnnotations(key, value))
    json.annotations = { deployment: { [key]: value } }
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchServiceAnnotations(key, value))
    json.annotations = { deployment: { [key]: value }, service: { [key]: value } }
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchIngressAnnotations(key, value))
    json.annotations = { deployment: { [key]: value }, service: { [key]: value }, ingress: { [key]: value } }
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const deploymentDiv = await getCategoryDiv('Deployment', page)
    const serviceDiv = await getCategoryDiv('Service', page)
    const ingressDiv = await getCategoryDiv('Ingress', page)
    await expect(deploymentDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(deploymentDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
    await expect(serviceDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(serviceDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
    await expect(ingressDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(ingressDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
  })
})
