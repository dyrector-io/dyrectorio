import { deploymentContainerLogUrl, deploymentDeployUrl, nodeContainerLogUrl, ROUTE_NODES } from '@app/routes'
import { expect, test } from '@playwright/test'
import { DAGENT_NODE, screenshotPath } from './utils/common'
import { addDeploymentToVersionlessProject, addImageToVersionlessProject, createProject } from './utils/projects'

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
  const prefix = 'deploy-log'
  const imageName = 'nginx'

  const projectId = await createProject(page, 'deploy-log-test', 'versionless')
  await addImageToVersionlessProject(page, projectId, imageName)
  const { url, id: deploymentId } = await addDeploymentToVersionlessProject(page, projectId, DAGENT_NODE, prefix)

  await page.goto(url)

  const deployButtonSelector = 'button:text-is("Deploy")'
  await page.waitForSelector(deployButtonSelector)

  await page.locator(deployButtonSelector).click()
  await page.waitForURL(deploymentDeployUrl(deploymentId))

  const containerRow = page.locator(`span:text-is("${imageName}") >> xpath=../..`)
  await expect(containerRow).toBeVisible()

  const runningTag = containerRow.locator(':text-is("Running")')
  await expect(runningTag).toBeVisible()

  const showLogs = containerRow.locator('span:text-is("Show logs")')

  await showLogs.click()
  await page.waitForURL(
    deploymentContainerLogUrl(deploymentId, {
      prefix,
      name: imageName,
    }),
  )

  await page.waitForSelector('div.font-roboto')
  const terminal = page.locator('div.font-roboto')
  await expect(await terminal.locator('span')).not.toHaveCount(0)
})

test('Container log should appear on a node container', async ({ page }) => {
  const prefix = 'node-deploy-log'
  const imageName = 'nginx'

  const porjectId = await createProject(page, 'node-deploy-log-test', 'versionless')
  await addImageToVersionlessProject(page, porjectId, imageName)
  const { url, id: deploymentId } = await addDeploymentToVersionlessProject(page, porjectId, DAGENT_NODE, prefix)

  await page.goto(url)

  const deployButtonSelector = 'button:text-is("Deploy")'
  await page.waitForSelector(deployButtonSelector)

  await page.locator(deployButtonSelector).click()
  await page.waitForURL(deploymentDeployUrl(deploymentId))

  const containerRow = await page.locator(`span:text-is("${imageName}") >> xpath=../..`)
  await expect(containerRow).toBeVisible()

  const runningTag = await containerRow.locator(':text-is("Running")')
  await expect(runningTag).toBeVisible()

  await page.goto(ROUTE_NODES)

  const nodeButton = await page.locator(`h3:has-text("${DAGENT_NODE}")`)
  await nodeButton.click()

  await page.locator('input[placeholder="Search"]').type(`${prefix}-${imageName}`)

  const nodeContainerRow = await page.locator(`span:text-is("${prefix}-${imageName}") >> xpath=../..`)
  await expect(nodeContainerRow).toHaveCount(1)

  const logButton = await nodeContainerRow.locator('img[src*="/note-text-outline.svg"]')
  await expect(logButton).toBeVisible()

  const nodeId = page.url().split('/').pop()

  await logButton.click()
  await page.waitForURL(
    nodeContainerLogUrl(nodeId, {
      name: `${prefix}-${imageName}`,
    }),
  )

  await page.waitForSelector('div.font-roboto')
  const terminal = await page.locator('div.font-roboto')
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
  await expect(await page.locator('p:has-text("ACME email is a required field")')).not.toBeVisible()

  await page.click('button:text-is("Generate script")')
  await expect(await page.locator('p:has-text("ACME email is a required field")')).toBeVisible()

  const acmeEmailInput = await page.locator('input[name="traefik.acmeEmail"]')
  await acmeEmailInput.type('a@b.c')
  await page.click('button:text-is("Generate script")')
  await expect(await page.locator('p:has-text("ACME email is a required field")')).not.toBeVisible()
})

test('Container list should show containers on the node screen', async ({ page }) => {
  await page.goto(ROUTE_NODES)

  const nodeButton = await page.locator(`h3:has-text("${DAGENT_NODE}")`)
  await nodeButton.click()

  await page.locator('input[placeholder="Search"]').type(`dagent`)

  const tableBody = await page.locator('.table-row-group')

  const nodeContainerRow = await tableBody.locator('.table-row')
  await nodeContainerRow.nth(0).waitFor()

  const containerRows = await nodeContainerRow.count()

  await expect(containerRows).toBeGreaterThanOrEqual(1)
})
