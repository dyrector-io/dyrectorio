import { expect, Page } from '@playwright/test'
import { test } from '../../utils/test.fixture'
import { NGINX_TEST_IMAGE_WITH_TAG, TEAM_ROUTES } from 'e2e/utils/common'
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
import { waitSocketRef, wsPatchSent } from '../../utils/websocket'
import { WS_TYPE_PATCH_CONFIG } from '@app/models'

const setup = async (
  page: Page,
  projectName: string,
  versionName: string,
  imageName: string,
): Promise<{ projectId: string; versionId: string; imageId: string }> => {
  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Incremental')
  const imageConfigId = await createImage(page, projectId, versionId, imageName)

  return { projectId, versionId, imageConfigId: imageConfigId }
}

test.describe('Image kubernetes config from editor', () => {
  test('Deployment strategy should be saved', async ({ page }) => {
    const { projectId, versionId, imageConfigId } = await setup(
      page,
      'deployment-strategy-editor',
      '1.0.0',
      NGINX_TEST_IMAGE_WITH_TAG,
    )

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    const strategy = 'rolling'

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchDeploymentStrategy(strategy))
    await page.locator(`button:has-text("${strategy}")`).click()
    await wsSent

    await page.reload()

    await expect(page.locator(`button.bg-dyo-turquoise:has-text("${strategy}")`)).toBeVisible()
  })

  test('Custom headers should be saved', async ({ page }) => {
    const { projectId, versionId, imageConfigId } = await setup(
      page,
      'custom-headers-editor',
      '1.0.0',
      NGINX_TEST_IMAGE_WITH_TAG,
    )

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    await page.locator('button:has-text("Custom headers")').click()

    const header = 'test-header'
    const input = page
      .locator('div.grid:has(label:has-text("CUSTOM HEADERS")) input[placeholder="Header name"]')
      .first()

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchCustomHeader(header))
    await input.fill(header)
    await wsSent

    await page.reload()

    await expect(input).toHaveValue(header)
  })

  test('Proxy headers should be saved', async ({ page }) => {
    const { projectId, versionId, imageConfigId } = await setup(
      page,
      'proxy-headers-editor',
      '1.0.0',
      NGINX_TEST_IMAGE_WITH_TAG,
    )

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    await page.locator('button:has-text("Proxy headers")').click()

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchProxyHeader(true))
    await page.locator('button[aria-checked="false"]:right-of(label:has-text("PROXY HEADERS"))').click()
    await wsSent

    await page.reload()

    await expect(page.locator(':right-of(:text("PROXY HEADERS"))').getByRole('switch', { checked: true })).toBeVisible()
  })

  test('Load balancer should be saved', async ({ page }) => {
    const { projectId, versionId, imageConfigId } = await setup(
      page,
      'load-balancer-editor',
      '1.0.0',
      NGINX_TEST_IMAGE_WITH_TAG,
    )

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    await page.locator('button:has-text("Use load balancer")').click()

    const key = 'balancer-key'
    const value = 'balancer-value'

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchLoadBalancer(true))
    await page.locator('button[aria-checked="false"]:right-of(label:has-text("USE LOAD BALANCER"))').click()
    await wsSent

    wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchLBAnnotations(key, value))
    await page.locator('div.grid:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Key"]').first().fill(key)
    await page
      .locator('div.grid:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Value"]')
      .first()
      .fill(value)
    await wsSent

    await page.reload()

    await expect(
      page.locator(':right-of(:text("USE LOAD BALANCER"))').getByRole('switch', { checked: true }),
    ).toBeVisible()
    await expect(
      page.locator('div.grid:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Key"]').first(),
    ).toHaveValue(key)
    await expect(
      page.locator('div.grid:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Value"]').first(),
    ).toHaveValue(value)
  })

  test('Health check config should be saved', async ({ page }) => {
    const { projectId, versionId, imageConfigId } = await setup(
      page,
      'health-check-editor',
      '1.0.0',
      NGINX_TEST_IMAGE_WITH_TAG,
    )

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    await page.locator('button:has-text("Health check config")').click()

    const port = 12560
    const liveness = 'test/liveness/'
    const readiness = 'test/readiness/'
    const startup = 'test/startup/'

    const hcConf = page.locator('div.grid:has(label:has-text("HEALTH CHECK CONFIG"))')

    const wsSent = wsPatchSent(
      ws,
      wsRoute,
      WS_TYPE_PATCH_CONFIG,
      wsPatchMatchHealthCheck(port, liveness, readiness, startup),
    )
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
    const { projectId, versionId, imageConfigId } = await setup(
      page,
      'resource-config-editor',
      '1.0.0',
      NGINX_TEST_IMAGE_WITH_TAG,
    )
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    await page.locator('button:has-text("Resource config")').click()

    const cpuLimits = '50'
    const cpuRequests = '25'
    const memoryLimits = '1m'
    const memoryRequests = '2m'

    const rsConf = page.locator('div.grid:has(label:has-text("RESOURCE CONFIG"))')

    const wsSent = wsPatchSent(
      ws,
      wsRoute,
      WS_TYPE_PATCH_CONFIG,
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

  const getCategoryDiv = async (category: string, page: Page) =>
    page.locator(`div.max-h-128 > div:nth-child(2):near(label:has-text("${category}"))`)

  test('Labels should be saved', async ({ page }) => {
    const { projectId, versionId, imageConfigId } = await setup(page, 'labels-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    await page.getByRole('button', { name: 'Labels', exact: true }).click()

    const key = 'label-key'
    const value = 'label-value'

    const deploymentDiv = await getCategoryDiv('Deployment', page)
    const serviceDiv = await getCategoryDiv('Service', page)
    const ingressDiv = await getCategoryDiv('Ingress', page)

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchDeploymentLabel(key, value))
    await deploymentDiv.locator('input[placeholder="Key"]').first().fill(key)
    await deploymentDiv.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchServiceLabel(key, value))
    await serviceDiv.locator('input[placeholder="Key"]').first().fill(key)
    await serviceDiv.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchIngressLabel(key, value))
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
    const { projectId, versionId, imageConfigId } = await setup(
      page,
      'annotations-editor',
      '1.0.0',
      NGINX_TEST_IMAGE_WITH_TAG,
    )

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.project.versions(projectId).detailsSocket(versionId)

    await page.getByRole('button', { name: 'Annotations', exact: true }).click()

    const key = 'annotation-key'
    const value = 'annotation-value'

    const deploymentDiv = await getCategoryDiv('Deployment', page)
    const serviceDiv = await getCategoryDiv('Service', page)
    const ingressDiv = await getCategoryDiv('Ingress', page)

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchDeploymentAnnotations(key, value))
    await deploymentDiv.locator('input[placeholder="Key"]').first().fill(key)
    await deploymentDiv.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchServiceAnnotations(key, value))
    await serviceDiv.locator('input[placeholder="Key"]').first().fill(key)
    await serviceDiv.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent
    wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchIngressAnnotations(key, value))
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
