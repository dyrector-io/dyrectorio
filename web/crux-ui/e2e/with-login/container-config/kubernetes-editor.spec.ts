import { HealthCheckProbe, WS_TYPE_PATCH_CONFIG } from '@app/models'
import { expect, Page } from '@playwright/test'
import { NGINX_TEST_IMAGE_WITH_TAG, TEAM_ROUTES } from 'e2e/utils/common'
import {
  wsPatchMatchCorsHeader,
  wsPatchMatchDeploymentAnnotations,
  wsPatchMatchDeploymentLabel,
  wsPatchMatchDeploymentStrategy,
  wsPatchMatchHealthCheck,
  wsPatchMatchIngressAnnotations,
  wsPatchMatchIngressLabel,
  wsPatchMatchLBAnnotations,
  wsPatchMatchLoadBalancer,
  wsPatchMatchProxyBuffering,
  wsPatchMatchProxyHeader,
  wsPatchMatchReplicas,
  wsPatchMatchResourceConfig,
  wsPatchMatchServiceAnnotations,
  wsPatchMatchServiceLabel,
} from 'e2e/utils/websocket-match'
import { createImage, createProject, createVersion } from '../../utils/projects'
import { test } from '../../utils/test.fixture'
import { waitSocketRef, wsPatchSent } from '../../utils/websocket'

const setup = async (
  page: Page,
  projectName: string,
  versionName: string,
  imageName: string,
): Promise<{ imageConfigId: string }> => {
  const projectId = await createProject(page, projectName, 'versioned')
  const versionId = await createVersion(page, projectId, versionName, 'Incremental')
  const imageConfigId = await createImage(page, projectId, versionId, imageName)

  return { imageConfigId }
}

test.describe('Image kubernetes config from editor', () => {
  test('Deployment strategy should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'deployment-strategy-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const strategy = 'rolling'

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchDeploymentStrategy(strategy))
    await page.locator('button:has-text("Deployment strategy")').click()
    await page.locator(`button:has-text("${strategy}")`).click()
    await wsSent

    await page.reload()

    await expect(page.locator(`button.bg-dyo-turquoise:has-text("${strategy}")`)).toBeVisible()
  })

  test('CORS headers should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'cors-headers-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("CORS headers")').click()

    const header = 'test-header'
    const input = page.locator('div:has(label:has-text("CORS HEADERS")) input[placeholder="Header name"]').first()

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchCorsHeader(header))
    await input.fill(header)
    await wsSent

    await page.reload()

    await expect(input).toHaveValue(header)
  })

  test('Proxy buffering should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'proxy-buffering-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Proxy buffering")').click()

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchProxyBuffering(true))
    await page.locator('button[aria-checked="false"]:right-of(label:has-text("PROXY BUFFERING"))').click()
    await wsSent

    await page.reload()

    await expect(
      page.locator(':right-of(:text("PROXY BUFFERING"))').getByRole('switch', { checked: true }),
    ).toBeVisible()
  })

  test('Proxy headers should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'proxy-headers-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Proxy headers")').click()

    const header = 'test-header'
    const input = page.locator('div:has(label:has-text("PROXY HEADERS")) input[placeholder="Header name"]').first()

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchProxyHeader(header))
    await input.fill(header)
    await wsSent

    await page.reload()

    await expect(input).toHaveValue(header)
  })

  test('Load balancer should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'load-balancer-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Use load balancer")').click()

    const key = 'balancer-key'
    const value = 'balancer-value'

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchLoadBalancer(true))
    await page.locator('button[aria-checked="false"]:right-of(label:has-text("USE LOAD BALANCER"))').click()
    await wsSent

    wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchLBAnnotations(key, value))
    await page.locator('div:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Key"]').first().fill(key)
    await page.locator('div:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Value"]').first().fill(value)
    await wsSent

    await page.reload()

    await expect(
      page.locator(':right-of(:text("USE LOAD BALANCER"))').getByRole('switch', { checked: true }),
    ).toBeVisible()
    await expect(
      page.locator('div:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Key"]').first(),
    ).toHaveValue(key)
    await expect(
      page.locator('div:has(label:has-text("USE LOAD BALANCER")) input[placeholder="Value"]').first(),
    ).toHaveValue(value)
  })

  test('Health check config should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'health-check-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Health check config")').click()

    const liveness: HealthCheckProbe = {
      type: 'http',
      path: 'test/liveness/',
      port: 8080,
    }
    const readiness: HealthCheckProbe = {
      type: 'grpc',
      path: 'test/readiness/',
      port: 5000,
    }
    const startup: HealthCheckProbe = {
      type: 'exec',
      command: [
        { id: 'test-startup-command-first-id', key: 'test/startup/command/first' },
        { id: 'test-startup-command-second-id', key: 'test/startup/command/second' },
      ],
    }

    const hcConf = page.locator('div:has(label:has-text("HEALTH CHECK CONFIG"))')

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchHealthCheck(liveness, readiness, startup))

    await hcConf.locator('button:text("HTTP"):near(:text("Liveness probe"))').click()
    await hcConf.locator('[name="healthCheckConfig.crane.livenessProbe.port"]').fill(liveness.port.toString())
    await hcConf.locator('[name="healthCheckConfig.crane.livenessProbe.path"]').fill(liveness.path)

    await hcConf.locator('button:text("gRPC"):near(:text("Readiness probe"))').click()
    await hcConf.locator('[name="healthCheckConfig.crane.readinessProbe.port"]').fill(readiness.port.toString())
    await hcConf.locator('[name="healthCheckConfig.crane.readinessProbe.path"]').fill(readiness.path)

    await hcConf.locator('button:text("Exec"):below(:text("Startup probe"))').click()
    await hcConf.locator('input[placeholder="Command"] >> visible=true').nth(0).fill(startup.command[0].key)
    await hcConf.locator('input[placeholder="Command"] >> visible=true').nth(1).fill(startup.command[1].key)

    await wsSent

    await page.reload()

    await expect(hcConf.locator('[name="healthCheckConfig.crane.livenessProbe.port"]')).toHaveValue(
      liveness.port.toString(),
    )
    await expect(hcConf.locator('[name="healthCheckConfig.crane.livenessProbe.path"]')).toHaveValue(liveness.path)
    await expect(hcConf.locator('[name="healthCheckConfig.crane.readinessProbe.port"]')).toHaveValue(
      readiness.port.toString(),
    )
    await expect(hcConf.locator('[name="healthCheckConfig.crane.readinessProbe.path"]')).toHaveValue(readiness.path)
    await expect(hcConf.locator('input[placeholder="Command"] >> visible=true').nth(0)).toHaveValue(
      startup.command[0].key,
    )
    await expect(hcConf.locator('input[placeholder="Command"] >> visible=true').nth(1)).toHaveValue(
      startup.command[1].key,
    )
  })

  test('Resource config should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'resource-config-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Resource config")').click()

    const cpuLimits = '50'
    const cpuRequests = '25'
    const memoryLimits = '1m'
    const memoryRequests = '2m'

    const rsConf = page.locator('div:has(label:has-text("RESOURCE CONFIG"))')

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
    page.locator(`div:nth-child(2):below(label:has-text("${category}"))`)

  test('Labels should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'labels-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

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
    const { imageConfigId } = await setup(page, 'annotations-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

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

  test('Replicas should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'replicas-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const replicas = 3

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchReplicas(replicas))
    await page.locator('button:has-text("Replicas")').click()
    await page.locator('input:right-of(label:has-text("REPLICAS"))').fill(replicas.toString())
    await wsSent

    await page.reload()

    await expect(page.locator('input:right-of(label:has-text("REPLICAS"))')).toHaveValue(replicas.toString())
  })
})
