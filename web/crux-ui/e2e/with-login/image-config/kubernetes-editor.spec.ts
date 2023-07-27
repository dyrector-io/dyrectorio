import { imageConfigUrl, versionWsUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'
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

test.describe('Image kubernetes config from editor', () => {
  test('Deployment strategy should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'deployment-strategy-editor', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    const strategy = 'rolling'

    let wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchDeploymentStrategy(strategy))
    await page.locator(`button:has-text("${strategy}")`).click()
    await wsSent

    await page.reload()

    await expect(page.locator(`button.bg-dyo-turquoise:has-text("${strategy}")`)).toBeVisible()
  })

  test('Custom headers should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'custom-headers-editor', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    await page.locator('button:has-text("Custom headers")').click()

    const header = 'test-header'
    const input = page
      .locator('div.grid:has(label:has-text("CUSTOM HEADERS")) input[placeholder="Header name"]')
      .first()

    let wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchCustomHeader(header))
    await input.fill(header)
    await wsSent

    await page.reload()

    await expect(input).toHaveValue(header)
  })

  test('Proxy headers should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'proxy-headers-editor', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    await page.locator('button:has-text("Proxy headers")').click()

    let wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchProxyHeader(true))
    await page.locator('button[aria-checked="false"]:right-of(label:has-text("PROXY HEADERS"))').click()
    await wsSent

    await page.reload()

    await expect(page.locator('button[aria-checked="true"]:right-of(label:has-text("PROXY HEADERS"))')).toBeVisible()
  })

  test('Load balancer should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'load-balancer-editor', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    await page.locator('button:has-text("Use load balancer")').click()

    const key = 'balancer-key'
    const value = 'balancer-value'

    let wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchLoadBalancer(true))
    await page.locator('button[aria-checked="false"]:right-of(label:has-text("USE LOAD BALANCER"))').click()
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchLBAnnotations(key, value))
    await page.locator('div.grid:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Key"]').first().fill(key)
    await page
      .locator('div.grid:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Value"]')
      .first()
      .fill(value)
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
    const { projectId, versionId, imageId } = await setup(page, 'health-check-editor', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    await page.locator('button:has-text("Health check config")').click()

    const port = 12560
    const liveness = 'test/liveness/'
    const readiness = 'test/readiness/'
    const startup = 'test/startup/'

    const hcConf = page.locator('div.grid:has(label:has-text("HEALTH CHECK CONFIG"))')

    let wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchHealthCheck(port, liveness, readiness, startup))
    await hcConf.locator('input[placeholder="Port"]').fill(port.toString())
    await hcConf.getByLabel('Liveness probe').fill(liveness)
    await hcConf.getByLabel('Readiness probe').fill(readiness)
    await hcConf.getByLabel('Startup probe').fill(startup)
    await wsSent

    await page.reload()

    await expect(hcConf.locator('input[placeholder="Port"]')).toHaveValue(port.toString())
    await expect(hcConf.getByLabel('Liveness probe')).toHaveValue(liveness)
    await expect(hcConf.getByLabel('Readiness probe')).toHaveValue(readiness)
    await expect(hcConf.getByLabel('Startup probe')).toHaveValue(startup)
  })

  test('Resource config should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'resource-config-editor', '1.0.0', 'redis')
    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    await page.locator('button:has-text("Resource config")').click()

    const cpuLimits = '50'
    const cpuRequests = '25'
    const memoryLimits = '1m'
    const memoryRequests = '2m'

    const rsConf = page.locator('div.grid:has(label:has-text("RESOURCE CONFIG"))')

    let wsSent = wsPatchSent(
      ws,
      wsRoute,
      wsPatchMatchResourceConfig(cpuLimits, cpuRequests, memoryLimits, memoryRequests),
    )
    await rsConf.locator('input').nth(0).fill(cpuLimits)
    await rsConf.locator('input').nth(1).fill(memoryLimits)
    await rsConf.locator('input').nth(2).fill(cpuRequests)
    await rsConf.locator('input').nth(3).fill(memoryRequests)
    await wsSent

    await page.reload()

    await expect(rsConf.locator('input').nth(0)).toHaveValue(cpuLimits)
    await expect(rsConf.locator('input').nth(1)).toHaveValue(memoryLimits)
    await expect(rsConf.locator('input').nth(2)).toHaveValue(cpuRequests)
    await expect(rsConf.locator('input').nth(3)).toHaveValue(memoryRequests)
  })

  test('Labels should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'labels-editor', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    await page.getByRole('button', { name: 'Labels', exact: true }).click()

    const key = 'label-key'
    const value = 'label-value'

    const deploymentDiv = await getCategoryDiv('Deployment', page)
    const serviceDiv = await getCategoryDiv('Service', page)
    const ingressDiv = await getCategoryDiv('Ingress', page)

    let wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchDeploymentLabel(key, value))
    await deploymentDiv.locator('input[placeholder="Key"]').first().fill(key)
    await deploymentDiv.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchServiceLabel(key, value))
    await serviceDiv.locator('input[placeholder="Key"]').first().fill(key)
    await serviceDiv.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchIngressLabel(key, value))
    await ingressDiv.locator('input[placeholder="Key"]').first().fill(key)
    await ingressDiv.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent

    await page.reload()

    await expect(deploymentDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(deploymentDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
    await expect(serviceDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(serviceDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
    await expect(ingressDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(ingressDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
  })

  test('Annotations should be saved', async ({ page }) => {
    const { projectId, versionId, imageId } = await setup(page, 'annotations-editor', '1.0.0', 'redis')

    const sock = waitSocket(page)
    await page.goto(imageConfigUrl(projectId, versionId, imageId))
    const ws = await sock
    const wsRoute = versionWsUrl(versionId)

    await page.getByRole('button', { name: 'Annotations', exact: true }).click()

    const key = 'annotation-key'
    const value = 'annotation-value'

    const deploymentDiv = await getCategoryDiv('Deployment', page)
    const serviceDiv = await getCategoryDiv('Service', page)
    const ingressDiv = await getCategoryDiv('Ingress', page)

    let wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchDeploymentAnnotations(key, value))
    await deploymentDiv.locator('input[placeholder="Key"]').first().fill(key)
    await deploymentDiv.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchServiceAnnotations(key, value))
    await serviceDiv.locator('input[placeholder="Key"]').first().fill(key)
    await serviceDiv.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, wsPatchMatchIngressAnnotations(key, value))
    await ingressDiv.locator('input[placeholder="Key"]').first().fill(key)
    await ingressDiv.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent

    await page.reload()

    await expect(deploymentDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(deploymentDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
    await expect(serviceDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(serviceDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
    await expect(ingressDiv.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(ingressDiv.locator('input[placeholder="Value"]').first()).toHaveValue(value)
  })
})

const getCategoryDiv = async (category: string, page: Page) => {
  return page.locator(`div.max-h-128 > div:nth-child(2):near(label:has-text("${category}"))`)
}
