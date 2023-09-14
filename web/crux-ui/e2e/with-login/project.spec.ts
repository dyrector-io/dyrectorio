import { expect, Page } from '@playwright/test'
import { test } from '../utils/test.fixture'
import { TEAM_ROUTES } from 'e2e/utils/common'
import { createProject, deleteProject } from 'e2e/utils/projects'

test.describe.configure({ mode: 'parallel' })

test.describe('Project', () => {
  test('Can create versioned project', async ({ page }) => {
    const projName = 'versioned-test-project'
    await createProject(page, projName, 'versioned')
    await page.waitForURL(`${TEAM_ROUTES.project.list()}/**`)
    await page.waitForSelector('h2:text-is("Projects")')
    await expect(page.locator('span:has-text("VERSIONED")')).toBeVisible()
  })

  test('Can create versionless project', async ({ page }) => {
    const projName = 'versionless-test-project'
    await createProject(page, projName, 'versionless')
    await page.waitForURL(`${TEAM_ROUTES.project.list()}/**`)
    await page.waitForSelector('h2:text-is("Projects")')
    await expect(page.locator('span:has-text("VERSIONED")')).not.toBeVisible()
    await expect(page.locator('button:has-text("Add image")')).toBeVisible()
  })

  test('Minimum name length requirement should work', async ({ page }) => {
    await page.goto(TEAM_ROUTES.project.list())
    await page.waitForSelector('h2:text-is("Projects")')

    await page.locator('button:has-text("Add")').click()
    await page.locator('h4:has-text("New project") >> visible=true')
    await page.locator('input[name="name"]').fill('12')
    await page.locator('button:has-text("Save")').click()
    await expect(page.locator('p:has-text("Name must be at least 3 characters")')).toBeVisible()
  })

  test('Can edit project', async ({ page }) => {
    const projName = 'edit-test-project'
    const projId = await createProject(page, projName, 'versionless')

    await page.goto(TEAM_ROUTES.project.details(projId))
    await page.waitForSelector('h2:text-is("Projects")')

    await page.locator(`h5:has-text('${projName}') >> visible=true`)
    await page.locator('button:has-text("Edit")').click()
    await page.locator('input[id="name"]').fill(projName.concat('-edited'))
    await page.locator('button:has-text("Save")').click()
    await page.locator('button:has-text("Edit") >> visible=true')
    await expect(page.locator(`h5:has-text('${projName}-edited')`)).toBeVisible()
  })

  test('Convert project type should work', async ({ page }) => {
    const projName = 'conversion-test-project'
    const projId = await createProject(page, projName, 'versionless')

    await page.goto(TEAM_ROUTES.project.details(projId))
    await page.waitForSelector('h2:text-is("Projects")')

    await page.locator('button:has-text("Edit")').click()
    await page.locator('button:has-text("Convert to versioned") >> visible=true').click()
    const overlay = await page.locator('div[role="dialog"]')
    await overlay.locator('button:has-text("Confirm")').click()
    await page.locator(`h5:has-text("${projName}") >> visible=true`)
    await expect(page.locator('div.card span:has-text("VERSIONED")')).toBeVisible()
  })

  test('Can delete project', async ({ page }) => {
    const projName = 'delete-test-project'
    const projId = await createProject(page, projName, 'versioned')

    await page.goto(TEAM_ROUTES.project.list())
    await page.waitForSelector('h2:text-is("Projects")')

    await expect(page.locator(`div.card a:has-text('${projName}')`)).toBeVisible()
    await deleteProject(page, projId)
    await expect(page.locator(`div.card a:has-text('${projName}')`)).not.toBeVisible()
  })

  test('Project text filter should work', async ({ page }) => {
    const projName = 'filter-by-name-test-project'
    await createProject(page, projName, 'versionless')

    await page.goto(TEAM_ROUTES.project.list())
    await page.waitForSelector('h2:text-is("Projects")')

    await expect(page.locator('h3:has-text("Filters")')).toBeVisible()
    await expect(page.locator('button.bg-dyo-turquoise:has-text("All")')).toBeVisible()
    await page.locator('input[placeholder="Search"] >> visible=true').fill(projName)
    await expect(page.getByAltText('Picture of ', { exact: false })).toHaveCount(1)
  })

  const createEmptyProjects = async (page: Page, prefix: string) => {
    await createProject(page, prefix.concat('-vrsd'), 'versioned')
    await createProject(page, prefix.concat('-vrsl'), 'versionless')
  }

  const projectFilterType = async (page: Page, projName: string, versioned: boolean, tileView: boolean) => {
    await createEmptyProjects(page, projName)
    await createProject(page, projName, versioned ? 'versioned' : 'versionless')

    await page.goto(TEAM_ROUTES.project.list())
    await page.waitForSelector('h2:text-is("Projects")')

    tileView
      ? await page.locator('img[src="/view_tile.svg"]').click()
      : await page.locator('img[src="/view_table.svg"]').click()

    const projNum: number = tileView
      ? await page.locator('div.card.w-full').count()
      : await page.locator('div.table-row-group div.table-row').count()
    versioned
      ? await page.locator('button:has-text("Versioned")').click()
      : await page.locator('button:has-text("Versionless")').click()

    expect(
      tileView
        ? await page.locator('div.card.w-full').count()
        : await page.locator('div.table-row-group div.table-row').count(),
    ).toBeLessThan(projNum)
  }

  test.describe('Project versioned filter should work', () => {
    test('in tile view', async ({ page }) => {
      await projectFilterType(page, 'filter-by-versioned-tile-project', true, true)
    })
    test('in list view', async ({ page }) => {
      await projectFilterType(page, 'filter-by-versioned-list-project', true, false)
    })
  })

  test.describe('Project versionless filter should work', () => {
    test('in tile view', async ({ page }) => {
      await projectFilterType(page, 'filter-by-versionless-tile-project', false, true)
    })

    test('in list view', async ({ page }) => {
      await projectFilterType(page, 'filter-by-versionless-list-project', false, false)
    })
  })
})
