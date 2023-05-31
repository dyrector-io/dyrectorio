import { expect, Page, test } from '@playwright/test'
import { createNode } from './utils/nodes'
import { addDeploymentToSimpleProject, addImageToSimpleProject, createProject } from './utils/projects'

const setup = async (
  page: Page,
  nodeName: string,
  projectName: string,
  type: 'Simple' | 'Complex' = 'Simple',
): Promise<{ nodeId: string; projectId: string }> => {
  const nodeId = await createNode(page, nodeName)
  const projectId = await createProject(page, projectName, type)

  return {
    nodeId,
    projectId,
  }
}

test('Can create multiple preparings to the same node with different prefixes', async ({ page }) => {
  const nodeName = 'NodeMultiPrefixes'
  const projectName = 'MultiPrefixesProject'
  const prefixOne = 'prefix-one'
  const prefixOther = 'prefix-other'

  const { projectId } = await setup(page, nodeName, projectName)
  await addImageToSimpleProject(page, projectId, 'nginx')
  const one = await addDeploymentToSimpleProject(page, projectId, nodeName, prefixOne)
  const other = await addDeploymentToSimpleProject(page, projectId, nodeName, prefixOther)

  await page.goto(one.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOne}")`)).toHaveCount(1)

  await page.goto(other.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOther}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOther}")`)).toHaveCount(1)
})

test('Can not create multiple preparings to the same node with the same prefix', async ({ page }) => {
  const nodeName = 'NodePrefixCollision'
  const projectName = 'NodePrefixCollision'
  const prefixOne = 'prefix-one'

  const { projectId } = await setup(page, nodeName, projectName)
  await addImageToSimpleProject(page, projectId, 'nginx')
  const one = await addDeploymentToSimpleProject(page, projectId, nodeName, prefixOne)
  await page.goto(one.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOne}")`)).toHaveCount(1)

  const other = await addDeploymentToSimpleProject(page, projectId, nodeName, prefixOne)

  expect(other.id, one.id)
  await page.goto(other.url)
  await page.waitForSelector(`label:has-text("Prefix: ${prefixOne}")`)
  await expect(await page.locator(`label:has-text("Prefix: ${prefixOne}")`)).toHaveCount(1)
})
