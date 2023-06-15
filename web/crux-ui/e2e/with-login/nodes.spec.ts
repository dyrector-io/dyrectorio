import { ROUTE_DASHBOARD, ROUTE_NODES } from '@app/routes'
import { expect, test } from '@playwright/test'
import { DAGENT_NODE, screenshotPath } from '../utils/common'

test('Install dagent should be successful', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  await page.locator(`h3:has-text("${DAGENT_NODE}")`).click()
  await page.waitForURL(`${ROUTE_NODES}/**`)

  await expect(await page.locator('span:has-text("Connected")')).toHaveCount(1)
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

  await expect(curl).toBeVisible()
  await expect(curl).toHaveValue(/curl/)
  await expect(script).toBeVisible()
  await expect(timer).toBeVisible()
  await expect(discardButton).toBeVisible()
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
  await expect(await page.locator('p:has-text("ACME email is a required field")')).not.toBeVisible()

  await page.click('button:text-is("Generate script")')
  await expect(await page.locator('p:has-text("ACME email is a required field")')).toBeVisible()

  const acmeEmailInput = await page.locator('input[name="dagentTraefik.acmeEmail"]')
  await acmeEmailInput.type('a@b.c')
  await page.click('button:text-is("Generate script")')
  await expect(await page.locator('p:has-text("ACME email is a required field")')).not.toBeVisible()
})

test('Deleting node', async ({ page }) => {
  const name = 'PW_DELETE_NODE'

  await page.goto(ROUTE_NODES)

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name] >> visible=true').fill(name)

  await page.locator('button:has-text("Save")').click()

  await page.locator(`h3:has-text("${name}")`).click()
  await page.waitForURL(`${ROUTE_NODES}/**`)

  await page.locator('button:has-text("Delete")').click()

  await page.locator('button:has-text("Delete"):left-of(:has-text("Cancel"))').click()

  await page.goto(ROUTE_NODES)
  await page.waitForURL(ROUTE_NODES)

  await expect(await page.locator(`h3:has-text("${name}")`).count()).toEqual(0)
})

test('Logs should show agent events', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  const nodeButton = await page.locator(`h3:has-text("${DAGENT_NODE}")`)
  await nodeButton.click()

  await page.locator('input[placeholder="Search"]').type(`dagent`)

  await page.locator('button:has-text("Logs")').click()

  const tableBody = await page.locator('.table-row-group')

  const nodeContainerRow = await tableBody.locator('.table-row')
  await nodeContainerRow.nth(0).waitFor()

  await expect(await nodeContainerRow.locator('div:has-text("Connected")')).toBeVisible()
})
