import { expect, Page } from '@playwright/test'
import { test } from '../../utils/test.fixture'
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
import { waitSocketRef, wsPatchSent } from '../../utils/websocket'
import { WS_TYPE_PATCH_CONFIG } from '@app/models'

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

test.describe('Image common config from JSON', () => {
  test('Container name should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'name-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const name = 'new-container-name'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.name = name

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchContainerName(name))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.locator('input[placeholder="Container name"]')).toHaveValue(name)
  })

  test('Expose strategy should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'expose-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.expose = 'exposeWithTls'

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchExpose('exposeWithTls'))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.locator('button.border-dyo-turquoise:has-text("HTTPS")')).toBeVisible()
  })

  test('User should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'user-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const user = 23

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.user = user

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchUser(user))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.locator('input[placeholder="Container default"]')).toHaveValue(user.toString())
  })

  test('TTY should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'tty-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.tty = true

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchTTY(true))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.locator(':right-of(:text("TTY"))').getByRole('switch', { checked: true })).toBeVisible()
  })

  test('Port should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'port-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
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

  test('Port ranges should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'port-range-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const internalFromAsNumber = 1000
    const internalToAsNumber = 2000
    const externalFromAsNumber = 3000
    const externalToAsNumber = 4000
    const internalTo = internalToAsNumber.toString()
    const internalFrom = internalFromAsNumber.toString()
    const externalTo = externalToAsNumber.toString()
    const externalFrom = externalFromAsNumber.toString()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.portRanges = [
      {
        internal: { from: internalFromAsNumber, to: internalToAsNumber },
        external: { from: externalFromAsNumber, to: externalToAsNumber },
      },
    ]

    const wsSent = wsPatchSent(
      ws,
      wsRoute,
      WS_TYPE_PATCH_CONFIG,
      wsPatchMatchPortRange(internalFrom, externalFrom, internalTo, externalTo),
    )
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const internalInputFrom = await page.locator('input[placeholder="From"]').nth(0)
    const internalInputTo = await page.locator('input[placeholder="To"]').nth(0)
    const externalInputFrom = await page.locator('input[placeholder="From"]').nth(1)
    const externalInputTo = await page.locator('input[placeholder="To"]').nth(1)

    await expect(internalInputTo).toHaveValue(internalTo)
    await expect(internalInputFrom).toHaveValue(internalFrom)
    await expect(externalInputTo).toHaveValue(externalTo)
    await expect(externalInputFrom).toHaveValue(externalFrom)
  })

  test('Secrets should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'secrets-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const secret = 'secretName'
    const secretInput = page.locator('input[placeholder="Secrets"] >> visible=true').nth(0)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.secrets = [{ key: secret, required: true }]

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchSecret(secret, true))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(secretInput).toHaveValue(secret)
    await expect(page.getByRole('switch', { checked: true }).locator(':right-of(:text("Required"))')).toBeVisible()
  })

  test('Commands should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'commands-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const command = 'sleep'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.commands = [command]

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchCommand(command))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.locator('input[placeholder="Commands"] >> visible=true').nth(0)).toHaveValue(command)
  })

  test('Arguments should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'arguments-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const argument = '1234'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.args = [argument]

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchArgument(argument))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.locator('input[placeholder="Arguments"] >> visible=true').nth(0)).toHaveValue(argument)
  })

  test('Routing should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'routing-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const domain = 'routing-domain-example.com'
    const path = '/testpath'
    const uploadLimit = '1024'
    const stripPath = true
    const port = 1000

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.ports = [{ internal: port, external: null }]
    json.routing = { domain, path, uploadLimit, stripPath, port }

    const wsSent = wsPatchSent(
      ws,
      wsRoute,
      WS_TYPE_PATCH_CONFIG,
      wsPatchMatchRouting(domain, path, uploadLimit, stripPath, port),
    )
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.locator('input[placeholder="Domain"]')).toHaveValue(domain)
    await expect(page.locator('input[placeholder="Path"]')).toHaveValue(path)
    await expect(page.getByRole('switch', { checked: true }).locator(':right-of(:text("Strip path"))')).toBeVisible()
    await expect(page.locator('input[placeholder="Upload limit"]')).toHaveValue(uploadLimit)
  })

  test('Environment should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'environment-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const key = 'env-key'
    const value = 'env-value'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.environment = { [key]: value }

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchEnvironment(key, value))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.locator('input[placeholder="Key"]').first()).toHaveValue(key)
    await expect(page.locator('input[placeholder="Value"]').first()).toHaveValue(value)
  })

  test('Config container should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'config-container-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const img = 'image'
    const volume = 'volume'
    const path = 'test/path/'

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.configContainer = { image: img, volume, path, keepFiles: true }

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchConfigContainer(img, volume, path, true))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const confDiv = page.locator('div:has(label:has-text("CONFIG CONTAINER"))')
    await expect(confDiv.getByLabel('Image')).toHaveValue(img)
    await expect(confDiv.getByLabel('Volume')).toHaveValue(volume)
    await expect(confDiv.getByLabel('Path')).toHaveValue(path)
    await expect(confDiv.getByRole('switch', { checked: true }).locator(':right-of(:text("Keep files"))')).toBeVisible()
  })

  test('Init containers should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'init-container-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
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

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.initContainers = [
      {
        name,
        image,
        args: [arg],
        command: [cmd],
        environment: { [envKey]: envVal },
        volumes: [{ name: volName, path: volPath }],
        useParentConfig: false,
      },
    ]

    const wsSent = wsPatchSent(
      ws,
      wsRoute,
      WS_TYPE_PATCH_CONFIG,
      wsPatchMatchInitContainer(name, image, volName, volPath, arg, cmd, envKey, envVal),
    )
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const confDiv = page.getByText('NAMEIMAGEVOLUMES')
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
    const { imageConfigId } = await setup(page, 'volume-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const name = 'volume-name'
    const size = '1024'
    const path = '/test/volume'
    const volumeClass = 'class'

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.volumes = [{ name, path, type: 'rwo', class: volumeClass, size }]

    const wsSent = wsPatchSent(ws, wsRoute, WS_TYPE_PATCH_CONFIG, wsPatchMatchVolume(name, size, path, volumeClass))
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    await expect(page.getByLabel('Name')).toHaveValue(name)
    await expect(page.getByLabel('Size')).toHaveValue(size)
    await expect(page.getByLabel('Path')).toHaveValue(path)
    await expect(page.getByLabel('Class (k8s)')).toHaveValue(volumeClass)
  })

  test('Storage should be saved', async ({ page }) => {
    const { imageConfigId } = await setup(page, 'storage-json', '1.0.0', NGINX_TEST_IMAGE_WITH_TAG)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')

    const volumeName = 'volume-name'
    const size = '1024'
    const path = '/test/volume'
    const volumeClass = 'class'
    const bucketPath = '/storage/'
    const storageName = 'image-json-storage'
    const storageId = await createStorage(page, storageName, 'storage.com', '1234', '12345')

    const sock = waitSocketRef(page)
    await page.goto(TEAM_ROUTES.containerConfig.details(imageConfigId))
    await page.waitForSelector('h2:text-is("Image config")')
    const ws = await sock
    const wsRoute = TEAM_ROUTES.containerConfig.detailsSocket(imageConfigId)

    const jsonEditorButton = await page.waitForSelector('button:has-text("JSON")')
    await jsonEditorButton.click()

    const jsonEditor = await page.locator('textarea')
    const json = JSON.parse(await jsonEditor.inputValue())
    json.volumes = [{ name: volumeName, path, type: 'rwo', class: volumeClass, size }]
    json.storage = { storageId, bucket: bucketPath, path: volumeName }

    const wsSent = wsPatchSent(
      ws,
      wsRoute,
      WS_TYPE_PATCH_CONFIG,
      wsPatchMatchStorage(storageId, bucketPath, volumeName),
    )
    await jsonEditor.fill(JSON.stringify(json))
    await wsSent

    await page.reload()

    const storageDiv = page.locator('div:has(label:has-text("STORAGE"))')
    await expect(storageDiv.locator(`button.bg-dyo-turquoise:has-text("${storageName}")`)).toBeVisible()
    await expect(storageDiv.locator('input[placeholder="Bucket path"]')).toHaveValue(bucketPath)
    await expect(storageDiv.locator(`button.bg-dyo-turquoise:has-text("${volumeName}")`)).toBeVisible()
  })
})
