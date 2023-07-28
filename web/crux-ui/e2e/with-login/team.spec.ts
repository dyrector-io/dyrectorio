import { ROUTE_TEAMS, teamUrl } from '@app/routes'
import { expect, test } from '@playwright/test'
import { createTeam, deleteTeam } from 'e2e/utils/teams'

test('Can create team', async ({ page }) => {
  const teamName = 'create-test-team'
  const slug = 'create-test-slug'

  await createTeam(page, teamName, slug)

  page.goto(ROUTE_TEAMS)
  await expect(page.locator(`h4:has-text('${teamName}')`)).toBeVisible()
})

test('Cant create teams with same name', async ({ page }) => {
  const teamName = 'same-name-test-team'
  const slug = 'same-name-test'

  await createTeam(page, teamName, slug)

  await page.goto(ROUTE_TEAMS)
  await page.locator('button:has-text("Add")').click()
  await page.locator('input[id="name"]').fill(teamName)
  await page.locator('input[id="slug"]').fill(`${slug}-2`)
  await page.locator('button:has-text("Save")').click()

  await expect(page.locator('p:has-text("Already exists")')).toBeVisible()
})

test('Cant create teams with same slug', async ({ page }) => {
  const teamName = 'same-slug-test-team'
  const slug = 'same-slug-test'

  await createTeam(page, teamName, slug)

  await page.goto(ROUTE_TEAMS)
  await page.locator('button:has-text("Add")').click()
  await page.locator('input[id="name"]').fill(`${teamName}-2`)
  await page.locator('input[id="slug"]').fill(slug)
  await page.locator('button:has-text("Save")').click()

  await expect(page.locator('p:has-text("Already exists")')).toBeVisible()
})

test('Can edit team', async ({ page }) => {
  const teamName = 'edit-test-team'
  const slug = 'edit-slug'

  const teamId = await createTeam(page, teamName, slug)

  await page.goto(teamUrl(teamId))
  await page.locator('button:has-text("Edit")').click()
  await expect(page.locator('input[id="name"]')).toHaveValue(teamName)

  await page.locator('input[id="name"]').fill(`${teamName}-new`)
  await page.locator('input[id="slug"]').fill(`${slug}-new`)
  await page.locator('button:has-text("Save")').click()
  await expect(page.locator(`label:has-text("${teamName}-new")`)).toBeVisible()
})

test('Can delete team', async ({ page }) => {
  const teamName = 'delete-test-team'
  const slug = 'delete-test-slug'

  const teamId = await createTeam(page, teamName, slug)

  await page.goto(ROUTE_TEAMS)
  await expect(page.locator(`h4:has-text('${teamName}')`)).toBeVisible()

  await deleteTeam(page, teamId)

  await page.goto(ROUTE_TEAMS)
  await expect(page.locator(`h4:has-text('${teamName}')`)).not.toBeVisible()
})

test('Minimum name length requirement should work', async ({ page }) => {
  await page.goto(ROUTE_TEAMS)
  await page.locator('button:has-text("Add")').click()
  await page.locator('h4:has-text("Create new team") >> visible=true')
  await page.locator('input[name="name"]').fill('12')
  await page.locator('button:has-text("Save")').click()
  await expect(page.locator('p:has-text("name must be at least 3 characters")')).toBeVisible()
})
