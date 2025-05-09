import { WS_TYPE_PATCH_CONFIG } from '@app/models'
import { expect, Page } from '@playwright/test'
import { NGINX_TEST_IMAGE_WITH_TAG, TEAM_ROUTES } from 'e2e/utils/common'
import { createStorage } from 'e2e/utils/storages'
import {
  wsPatchMatchArgument,
  wsPatchMatchCommand,
  wsPatchMatchConfigContainer,
  wsPatchMatchContainerName,
  wsPatchMatchEnvironment,
  wsPatchMatchExpose,
  wsPatchMatchInitContainer,
  wsPatchMatchPortRange,
  wsPatchMatchPorts,
  wsPatchMatchRouting,
  wsPatchMatchSecret,
  wsPatchMatchStorage,
  wsPatchMatchTTY,
  wsPatchMatchUser,
  wsPatchMatchVolume,
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

test.describe.configure({ mode: 'parallel' })

test.describe('Image common config from editor', () => {
  test('Container name should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'name-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const name = 'new-container-name'

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchContainerName(name))
    await page.locator('button:has-text("Name")').click()
    await page.locator('input[placeholder="Container name"]').fill(name)
    await wsSent

    await page.reload()

    await expect(page.locator('input[placeholder="Container name"]')).toHaveValue(name)
  })

  test('Expose strategy should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'expose-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchExpose('exposeWithTls'))
    await page.locator('button:has-text("Expose")').click()
    await page.getByRole('button', { name: 'HTTPS', exact: true }).click()
    await wsSent

    await page.reload()

    await expect(page.locator('button.border-dyo-turquoise:has-text("HTTPS")')).toBeVisible()
  })

  test('User should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'user-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const user = 23

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchUser(user))
    await page.locator('button:has-text("User")').click()
    await page.locator('input[placeholder="Container default"]').fill(user.toString())
    await wsSent

    await page.reload()

    await expect(page.locator('input[placeholder="Container default"]')).toHaveValue(user.toString())
  })

  test('TTY should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'tty-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("TTY")').click()

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchTTY(true))
    await page.locator('button[aria-checked="false"]:right-of(label:has-text("TTY"))').click()
    await wsSent

    await page.reload()

    await expect(page.locator(':right-of(:text("TTY"))').getByRole('switch', { checked: true })).toBeVisible()
  })

  test('Port should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'port-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Ports")').click()

    const addPortsButton = await page.locator(`[src="/plus.svg"]:right-of(label:has-text("Ports"))`).first()
    await addPortsButton.click()
    const internal = '1000'
    const external = '2000'

    const internalInput = page.locator('input[placeholder="Internal"]')
    const externalInput = page.locator('input[placeholder="External"]')

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchPorts(internal, external))
    await internalInput.fill(internal)
    await externalInput.fill(external)
    await wsSent

    await page.reload()

    await expect(internalInput).toHaveValue(internal)
    await expect(externalInput).toHaveValue(external)
  })

  test('Port ranges should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'port-range-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Port ranges")').click()

    await page.locator(`[src="/plus.svg"]:right-of(label:has-text("Port ranges"))`).first().click()

    const internalFrom = '1000'
    const internalTo = '2000'
    const externalFrom = '3000'
    const externalTo = '4000'

    const internalInputFrom = await page.locator('input[placeholder="From"]').nth(0)
    const internalInputTo = await page.locator('input[placeholder="To"]').nth(0)
    const externalInputFrom = await page.locator('input[placeholder="From"]').nth(1)
    const externalInputTo = await page.locator('input[placeholder="To"]').nth(1)

    const wsSent = wsPatchSent(
      ws,
      wsRoute,
      WS_TYPE_PATCH_CONFIG,
      wsPatchMatchPortRange(internalFrom, externalFrom, internalTo, externalTo),
    )
    await internalInputFrom.fill(internalFrom)
    await internalInputTo.fill(internalTo)
    await externalInputFrom.fill(externalFrom)
    await externalInputTo.fill(externalTo)
    await wsSent

    await page.reload()

    await expect(internalInputFrom).toHaveValue(internalFrom)
    await expect(internalInputTo).toHaveValue(internalTo)
    await expect(externalInputFrom).toHaveValue(externalFrom)
    await expect(externalInputTo).toHaveValue(externalTo)
  })

  test('Secrets should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'secrets-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Secrets")').click()

    const secret = 'secretName'
    const secretInput = page.locator('input[placeholder="Secrets"] >> visible=true').nth(0)

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchSecret(secret, true))
    await secretInput.fill(secret)

    await page.getByRole('switch', { checked: false }).locator(':right-of(:text("Required"))').click()
    await wsSent

    await page.reload()

    await expect(secretInput).toHaveValue(secret)
    await expect(page.getByRole('switch', { checked: true }).locator(':right-of(:text("Required"))')).toBeVisible()
  })

  test('Commands should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'commands-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Commands")').click()

    const command = 'sleep'
    const commandInput = page.locator('input[placeholder="Commands"] >> visible=true').nth(0)

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchCommand(command))
    await commandInput.fill(command)
    await wsSent

    await page.reload()

    await expect(commandInput).toHaveValue(command)
  })

  test('Arguments should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'arguments-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Arguments")').click()

    const argument = '1234'
    const argumentInput = page.locator('input[placeholder="Arguments"] >> visible=true').nth(0)

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchArgument(argument))
    await argumentInput.fill(argument)
    await wsSent

    await page.reload()

    await expect(argumentInput).toHaveValue(argument)
  })

  test('Routing should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'routing-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Ports")').click()

    const addPortsButton = await page.locator(`[src="/plus.svg"]:right-of(label:has-text("Ports"))`).first()
    await addPortsButton.click()
    const internal = '1000'

    const internalInput = page.locator('input[placeholder="Internal"]')

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchPorts(internal))
    await internalInput.fill(internal)
    await wsSent

    await page.locator('button:has-text("Routing")').click()

    const domain = 'routing-domain-example.com'
    const path = '/testpath'
    const uploadLimit = '1024'
    const stripPath = true
    const routedPort = Number.parseInt(internal, 10)

    wsSent = wsPatchSent(
      ws,
      wsRoute,
      WS_TYPE_PATCH_CONFIG,
      wsPatchMatchRouting(domain, path, uploadLimit, stripPath, routedPort),
    )
    await page.locator('input[placeholder="Domain"]').fill(domain)
    await page.locator('input[placeholder="Path"]').fill(path)
    if (stripPath) {
      await page.getByRole('switch', { checked: false }).click()
    }
    await page.locator('input[placeholder="Upload limit"]').fill(uploadLimit)
    await page.click(`button:text-is("${routedPort}"):right-of(:text-is("Port"))`)
    await wsSent

    await page.reload()

    await expect(page.locator('input[placeholder="Domain"]')).toHaveValue(domain)
    await expect(page.locator('input[placeholder="Path"]')).toHaveValue(path)
    await expect(page.getByRole('switch', { checked: true }).locator(':right-of(:text("Strip path"))')).toBeVisible()
    await expect(page.locator('input[placeholder="Upload limit"]')).toHaveValue(uploadLimit)
  })

  test('Environment should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'environment-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Environment")').click()

    const key = 'env-key'
    const value = 'env-value'

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchEnvironment(key, value))
    await page.locator('input[placeholder="Key"]').first().fill(key)
    await page.locator('input[placeholder="Value"]').first().fill(value)
    await wsSent

    await page.reload()

    await expect(page.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(page.locator('input[placeholder="Value"]').first()).toHaveValue(value)
  })

  test('Config container should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'config-container-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Config container")').click()
    const confDiv = page.locator('div:has(label:has-text("CONFIG CONTAINER"))')

    const img = 'image'
    const volume = 'volume'
    const path = 'test/path/'

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchConfigContainer(img, volume, path, true))
    await confDiv.getByLabel('Image').fill(img)
    await confDiv.getByLabel('Volume').fill(volume)
    await confDiv.getByLabel('Path').fill(path)
    await confDiv.getByRole('switch', { checked: false }).locator(':right-of(:text("Keep files"))').click()
    await wsSent

    await page.reload()

    await expect(confDiv.getByLabel('Image')).toHaveValue(img)
    await expect(confDiv.getByLabel('Volume')).toHaveValue(volume)
    await expect(confDiv.getByLabel('Path')).toHaveValue(path)
    await expect(confDiv.getByRole('switch', { checked: true }).locator(':right-of(:text("Keep files"))')).toBeVisible()
  })

  test('Init containers should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'init-container-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const name = 'container-name'
    const image = 'image'
    const volName = 'vol-name'
    const volPath = 'vol-path'
    const arg = '123'
    const cmd = 'sleep'
    const envKey = 'env-key'
    const envVal = 'env-val'

    await page.locator('button:has-text("Init containers")').click()

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG)
    await page.locator(`[src="/plus.svg"]:right-of(label:has-text("Init containers"))`).first().click()
    await wsSent

    const confDiv = page.getByText('NAMEIMAGEVOLUMES')

    wsSent = wsPatchSent(
      ws,
      wsRoute,
      WS_TYPE_PATCH_CONFIG,
      wsPatchMatchInitContainer(name, image, volName, volPath, arg, cmd, envKey, envVal),
    )
    await confDiv.getByLabel('NAME').fill(name)
    await confDiv.getByLabel('IMAGE').fill(image)
    await confDiv.locator('input[placeholder="Name"]').first().fill(volName)
    await confDiv.locator('input[placeholder="Path"]').first().fill(volPath)
    await confDiv.locator('input[placeholder="Arguments"]').first().fill(arg)
    await confDiv.locator('input[placeholder="Command"]').first().fill(cmd)
    await confDiv.locator('input[placeholder="Key"]').first().fill(envKey)
    await confDiv.locator('input[placeholder="Value"]').first().fill(envVal)
    await wsSent

    await page.reload()

    await expect(confDiv.getByLabel('NAME')).toHaveValue(name)
    await expect(confDiv.getByLabel('IMAGE')).toHaveValue(image)
    await expect(confDiv.locator('input[placeholder="Name"]').first()).toHaveValue(volName)
    await expect(confDiv.locator('input[placeholder="Path"]').first()).toHaveValue(volPath)
    await expect(confDiv.locator('input[placeholder="Arguments"]').first()).toHaveValue(arg)
    await expect(confDiv.locator('input[placeholder="Command"]').first()).toHaveValue(cmd)
    await expect(confDiv.locator('input[placeholder="Key"]').first()).toHaveValue(envKey)
    await expect(confDiv.locator('input[placeholder="Value"]').first()).toHaveValue(envVal)
  })

  test('Volume should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'volume-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Volume")').click()

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG)
    await page.locator(`[src="/plus.svg"]:right-of(label:has-text("Volume"))`).first().click()
    await wsSent

    const name = 'volume-name'
    const size = '1024'
    const path = '/test/volume'
    const volumeClass = 'class'

    wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchVolume(name, size, path, volumeClass))
    await page.getByLabel('Name').fill(name)
    await page.getByLabel('Size').fill(size)
    await page.getByLabel('Path').fill(path)
    await page.getByLabel('Class (k8s)').fill(volumeClass)
    await wsSent

    await page.reload()

    await expect(page.getByLabel('Name')).toHaveValue(name)
    await expect(page.getByLabel('Size')).toHaveValue(size)
    await expect(page.getByLabel('Path')).toHaveValue(path)
    await expect(page.getByLabel('Class (k8s)')).toHaveValue(volumeClass)
  })

  test('Storage should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'storage-editor', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const storageName = 'image-editor-storage'
    const storageId = await createStorage(page, storageName, 'storage.com', '1234', '12345')

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    await page.locator('button:has-text("Volume")').click()

    let wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG)
    await page.locator(`[src="/plus.svg"]:right-of(label:has-text("Volume"))`).first().click()
    await wsSent

    const volumeName = 'storage-volume'
    const size = '1024'
    const path = '/storage/volume'
    const volumeClass = 'class'

    wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchVolume(volumeName, size, path, volumeClass))
    await page.getByLabel('Name').fill(volumeName)
    await page.getByLabel('Size').fill(size)
    await page.getByLabel('Path').fill(path)
    await page.getByLabel('Class (k8s)').fill(volumeClass)
    await wsSent

    const storageDiv = page.locator('div:has(label:has-text("STORAGE"))')
    const bucketPath = '/storage/'
    await page.locator('button:has-text("Storage")').click()

    wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchStorage(storageId, bucketPath, volumeName))
    await storageDiv.locator(`button:has-text("${storageName}")`).click()
    await storageDiv.locator('input[placeholder="Bucket path"]').fill(bucketPath)
    await storageDiv.locator(`button:has-text("${volumeName}")`).click()
    await wsSent

    await page.reload()

    await expect(storageDiv.locator(`button.bg-dyo-turquoise:has-text("${storageName}")`)).toBeVisible()
    await expect(storageDiv.locator('input[placeholder="Bucket path"]')).toHaveValue(bucketPath)
    await expect(storageDiv.locator(`button.bg-dyo-turquoise:has-text("${volumeName}")`)).toBeVisible()
  })
})
