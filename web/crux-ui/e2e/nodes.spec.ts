import { ROUTE_NODES } from '@app/routes'
import { expect, test } from '@playwright/test'
import { DAGENT_NODE, screenshotPath } from './utils/common'
import { addDeploymentToSimpleProduct, addImageToSimpleProduct, createProduct } from './utils/products'

test('Install dagent should be successful', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  const navigation = page.waitForNavigation({ url: `**${ROUTE_NODES}/**` })
  await page.locator(`h3:has-text("${DAGENT_NODE}")`).click()
  await navigation

  await expect(await page.locator('span:has-text("Running")')).toHaveCount(1)
})

test('After adding a new node the setup process should be shown', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name] >> visible=true').fill('PW_NEW_NODE')

  await page.screenshot({ path: screenshotPath('new-node'), fullPage: true })

  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('h4:has-text("Technology")')

  const dockerHost = await page.locator('button:has-text("Docker Host")')
  const kubernetesCluster = await page.locator('button:has-text("Kubernetes Cluster")')
  const generateScript = await page.locator('button:has-text("Generate script")')

  await expect(dockerHost).toBeVisible()
  await expect(kubernetesCluster).toBeVisible()
  await expect(generateScript).toBeVisible()
})

test('Should not create the new node if the name already exist', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name] >> visible=true').fill('PW_NEW_NODE')

  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('p.text-error-red')

  const error = await page.locator('p.text-error-red')

  await expect(error).toContainText('Already exists')
})

test('Generate script should show the curl command and the script', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name]').fill('PW_DAGENT_SCRIPT')

  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('h4:has-text("Technology")')

  const dockerHost = await page.locator('button:has-text("Docker Host")')
  await dockerHost.click()

  const rootPath = await page.locator('input[placeholder="Optional, leave empty for default paths"]')
  await expect(rootPath).toBeVisible()

  const generateScript = await page.locator('button:has-text("Generate script")')
  await generateScript.click()

  await page.waitForSelector('input[readonly]')

  await page.screenshot({ path: screenshotPath('node-script'), fullPage: true })

  const curl = await page.locator('input[readonly]')
  const script = await page.locator('textarea[readonly]')
  const timer = await page.locator('label.text-dyo-turquoise')
  const discardButton = await page.locator('button:has-text("Discard")').first()
  const copyButton = await page.locator('button:has-text("Copy")')

  await expect(curl).toBeVisible()
  await expect(curl).toHaveValue(/curl/)
  await expect(script).toBeVisible()
  await expect(timer).toBeVisible()
  await expect(discardButton).toBeVisible()
  await expect(copyButton).toBeVisible()
})

test('Generate script should show script type selector for Docker', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name]').fill('PW_DAGENT_DOCKER_SCRIPT')

  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('h4:has-text("Technology")')

  const dockerHost = await page.locator('button:has-text("Docker Host")')
  await dockerHost.click()

  const rootPath = await page.locator('input[placeholder="Optional, leave empty for default paths"]')
  await expect(rootPath).toBeVisible()

  await expect(await page.locator('button:text-is("Shell")')).toBeVisible()
  await expect(await page.locator('button:text-is("PowerShell")')).toBeVisible()
})

test('Container log should appear after a successful deployment', async ({ page }) => {
  const prefix = 'pw-deploy-log'
  const imageName = 'nginx'

  const productId = await createProduct(page, 'PW-DEPLOY-LOG-TEST', 'Simple')
  await addImageToSimpleProduct(page, productId, imageName)
  const { url } = await addDeploymentToSimpleProduct(page, productId, DAGENT_NODE, prefix)

  await page.goto(url)

  await page.waitForSelector('button:text-is("Deploy")')
  await page.locator('button:text-is("Deploy")').click()
  await page.waitForNavigation()

  const containerRow = await page.locator(`span:text-is("${imageName}") >> xpath=../..`)
  await expect(containerRow).toBeVisible()

  const runningTag = await containerRow.locator('div:text-is("Running")')
  await expect(runningTag).toBeVisible()

  const showLogs = await containerRow.locator('span:text-is("Show logs")')
  await showLogs.click()

  await page.waitForNavigation()

  const terminal = page.locator('div.font-roboto')
  await expect(await terminal.locator('span')).not.toHaveCount(0)
})

test('Container log should appear on a node container', async ({ page }) => {
  const prefix = 'pw-node-deploy-log'
  const imageName = 'nginx'

  const productId = await createProduct(page, 'PW-NODE-DEPLOY-LOG-TEST', 'Simple')
  await addImageToSimpleProduct(page, productId, imageName)
  const { url } = await addDeploymentToSimpleProduct(page, productId, DAGENT_NODE, prefix)

  await page.goto(url)

  await page.waitForSelector('button:text-is("Deploy")')
  await page.locator('button:text-is("Deploy")').click()
  await page.waitForNavigation()

  const containerRow = await page.locator(`span:text-is("${imageName}") >> xpath=../..`)
  await expect(containerRow).toBeVisible()

  const runningTag = await containerRow.locator('div:text-is("Running")')
  await expect(runningTag).toBeVisible()

  await page.goto(ROUTE_NODES)

  const nodeButton = await page.locator(`h3:has-text("${DAGENT_NODE}")`)
  await nodeButton.click()

  const nodeContainerRow = await page.locator(`span:text-is("${prefix}-${imageName}") >> xpath=../..`)
  await expect(nodeContainerRow).toHaveCount(1)

  const logButton = await nodeContainerRow.locator('img[src*="/note-text-outline.svg"]')
  await expect(logButton).toBeVisible()

  await logButton.click()

  await page.waitForNavigation()

  const terminal = page.locator('div.font-roboto')
  await expect(await terminal.locator('span')).not.toHaveCount(0)
})

test('Docker generate script should show Traefik options', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name]').fill('PW_DAGENT_DOCKER_TRAEFIK')

  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('h4:has-text("Technology")')

  const dockerHost = await page.locator('button:has-text("Docker Host")')
  await dockerHost.click()

  await expect(await page.locator('label:has-text("Traefik ACME email")')).not.toBeVisible()

  const traefikToggleContainer = await page.locator('label:has-text("Install Traefik") >> xpath=..')
  const traefikToggle = await traefikToggleContainer.locator('button')
  await traefikToggle.click()

  await expect(await page.locator('label:has-text("Traefik ACME email")')).toBeVisible()

  await expect(await page.locator('p:has-text("ACME email is a required field")')).toBeVisible()

  const acmeEmailInput = await page.locator('input[name="traefik.acmeEmail"]')
  await acmeEmailInput.type('a@b.c')

  await expect(await page.locator('p:has-text("ACME email is a required field")')).not.toBeVisible()
})
