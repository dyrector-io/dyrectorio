import { expect } from '@playwright/test'
import { deployWithDagent } from 'e2e/utils/node-helper'
import { addImageToVersionlessProject, createProject } from 'e2e/utils/projects'
import { DAGENT_NODE, TEAM_ROUTES, screenshotPath, startContainer, stopContainer } from '../utils/common'
import { test } from '../utils/test.fixture'

test('Install dagent should be successful', async ({ page }) => {
  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('input[placeholder="Search"]').type(DAGENT_NODE)
  await page.locator(`h3:has-text("${DAGENT_NODE}")`).click()
  await page.waitForURL(`${TEAM_ROUTES.node.list()}/**`)
  await page.waitForSelector('h2:text-is("Nodes")')

  await expect(await page.locator('span:has-text("Connected")')).toHaveCount(1)
})

test('After adding a new node the setup process should be shown', async ({ page }) => {
  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name] >> visible=true').fill('PW_NEW_NODE')

  await page.screenshot({ path: screenshotPath('new-node'), fullPage: true })

  await page.locator('button:has-text("Save")').click()

  await page.waitForURL(`${TEAM_ROUTES.node.list()}/**`)

  await page.waitForSelector('h4:has-text("Technology")')

  const dockerHost = await page.locator('button:has-text("Docker Host")')
  const kubernetesCluster = await page.locator('button:has-text("Kubernetes Cluster")')
  const generateScript = await page.locator('button:has-text("Generate script")')

  await expect(dockerHost).toBeVisible()
  await expect(kubernetesCluster).toBeVisible()
  await expect(generateScript).toBeVisible()
})

test('Should not create the new node if the name already exist', async ({ page }) => {
  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name] >> visible=true').fill('PW_NEW_NODE')

  await page.locator('button:has-text("Save")').click()

  await page.waitForSelector('p.text-error-red')

  const error = await page.locator('p.text-error-red')

  await expect(error).toContainText('Already exists')
})

test('Generate script should show the curl command and the script', async ({ page }) => {
  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name]').fill('PW_DAGENT_SCRIPT')

  await page.locator('button:has-text("Save")').click()

  await page.waitForURL(`${TEAM_ROUTES.node.list()}/**`)

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
  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name]').fill('PW_DAGENT_DOCKER_SCRIPT')

  await page.locator('button:has-text("Save")').click()

  await page.waitForURL(`${TEAM_ROUTES.node.list()}/**`)

  await page.waitForSelector('h4:has-text("Technology")')

  const dockerHost = await page.locator('button:has-text("Docker Host")')
  await dockerHost.click()

  const rootPath = await page.locator('input[placeholder="Optional, leave empty for default paths"]')
  await expect(rootPath).toBeVisible()

  await expect(await page.locator('button:text-is("Shell")')).toBeVisible()
  await expect(await page.locator('button:text-is("PowerShell")')).toBeVisible()
})

test('Docker generate script should show Traefik options', async ({ page }) => {
  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name]').fill('PW_DAGENT_DOCKER_TRAEFIK')

  await page.locator('button:has-text("Save")').click()

  await page.waitForURL(`${TEAM_ROUTES.node.list()}/**`)

  await page.waitForSelector('h4:has-text("Technology")')

  const dockerHost = await page.locator('button:has-text("Docker Host")')
  await dockerHost.click()

  await expect(await page.locator('label:has-text("Traefik ACME email")')).not.toBeVisible()

  const traefikToggleContainer = await page.locator('label:has-text("Install Traefik") >> xpath=..')
  const traefikToggle = await traefikToggleContainer.locator('button')
  await traefikToggle.click()

  await expect(await page.locator('label:has-text("Traefik ACME email")')).toBeVisible()
  await expect(await page.locator('p:has-text("Traefik ACME email is required")')).not.toBeVisible()

  await page.click('button:text-is("Generate script")')
  await expect(await page.locator('p:has-text("Traefik ACME email is required")')).toBeVisible()

  const acmeEmailInput = await page.locator('input[name="dagentTraefik.acmeEmail"]')
  await acmeEmailInput.type('a@b.c')
  await page.click('button:text-is("Generate script")')
  await expect(await page.locator('p:has-text("Traefik ACME email is required")')).not.toBeVisible()
})

test('Deleting node', async ({ page }) => {
  const name = 'PW_DELETE_NODE'

  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('button:has-text("Add")').click()

  await page.locator('input[name=name] >> visible=true').fill(name)

  await page.locator('button:has-text("Save")').click()

  await page.waitForURL(`${TEAM_ROUTES.node.list()}/**`)

  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('button:has-text("Discard")').click()

  await page.locator('button:has-text("Delete")').click()

  await page.locator('button:has-text("Delete"):left-of(:has-text("Cancel"))').click()

  await page.waitForURL(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await expect(await page.locator(`h3:has-text("${name}")`)).not.toBeVisible()
})

test('Logs should show agent events', async ({ page }) => {
  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('input[placeholder="Search"]').type(`dagent`)

  const nodeButton = await page.locator(`h3:has-text("${DAGENT_NODE}")`)
  await nodeButton.click()

  await page.locator('button:has-text("Logs")').click()

  const nodeContainerRow = await page.locator('table.w-full >> tbody >> tr')
  await nodeContainerRow.nth(0).waitFor()

  await expect(await nodeContainerRow.locator('td:has-text("Connected")').nth(0)).toBeVisible()
})

test('Stopping the underlying container of a log stream should not affect the container states stream', async ({
  page,
  browser,
}) => {
  const prefix = 'log'
  const image = 'nginx'
  const containerName = `pw-${prefix}-${image}`

  const projectId = await createProject(page, 'node-log-stream', 'versionless')
  await addImageToVersionlessProject(page, projectId, image)
  await deployWithDagent(page, prefix, projectId)

  await page.goto(TEAM_ROUTES.node.list())
  await page.waitForSelector('h2:text-is("Nodes")')

  await page.locator('input[placeholder="Search"]').type(`dagent`)

  const nodeButton = await page.locator(`h3:has-text("${DAGENT_NODE}")`)
  await nodeButton.click()

  await page.locator('button:has-text("Containers")').click()

  await page.getByPlaceholder('Search').fill(prefix)
  await expect(page.locator('table.w-full >> tbody >> tr')).toHaveCount(1)

  const row = page.getByRole('row', { name: containerName })

  await expect(row.getByRole('cell', { name: 'Running' }).nth(0)).toBeVisible()

  const nodeId = page.url().split('/').pop()

  await row.getByAltText('Logs').click()

  await page.waitForURL(
    TEAM_ROUTES.node.containerLog(nodeId, {
      name: containerName,
    }),
    {
      waitUntil: 'domcontentloaded',
    },
  )

  await page.waitForSelector(`h4:text-is("Log of ${containerName}")`)

  await stopContainer(containerName)

  // check status
  const detailsPage = await browser.newPage()

  await detailsPage.goto(TEAM_ROUTES.node.details(nodeId))

  await detailsPage.locator('button:has-text("Containers")').click()

  const detailsRow = detailsPage.getByRole('row', { name: containerName })

  await expect(detailsRow.getByRole('cell', { name: 'Exited' }).nth(0)).toBeVisible()

  await startContainer(containerName)

  await expect(detailsRow.getByRole('cell', { name: 'Running' }).nth(0)).toBeVisible()
})
