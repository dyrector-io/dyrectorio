import { ROUTE_TEAMS, teamUrl } from '@app/routes'
import { expect, Page, test } from '@playwright/test'

test('Can create team', async ({ page }) => {
  const teamName = 'create-test-team'
  await createTeam(page, teamName)
  page.goto(ROUTE_TEAMS)
  await expect(page.locator(`h4:has-text('${teamName}')`)).toBeVisible()
})

test('Cant create teams with same name', async ({ page }) => {
  const teamName = 'same-name-test-team'
  await createTeam(page, teamName)
  await page.goto(ROUTE_TEAMS)
  await page.locator('button:has-text("Add")').click()
  await page.locator('input[id="name"]').fill(teamName)
  await page.locator('button:has-text("Save")').click()
  await expect(page.locator('p:has-text("Already exists")')).toBeVisible()
})

test('Can edit team', async ({ page }) => {
  const teamName = 'edit-test-team'
  const teamId = await createTeam(page, teamName)
  await page.goto(teamUrl(teamId))
  await page.locator('button:has-text("Edit")').click()
  await expect(page.locator('input[id="name"]')).toHaveValue(teamName)
  await page.locator('input[id="name"]').fill(teamName.concat('-new'))
  await page.locator('button:has-text("Save")').click()
  await expect(page.locator(`label:has-text("${teamName}-new")`)).toBeVisible()
})

/*test('Can delete team',async({page})=>{
    const teamName="delete-test-team"
    const teamId=await createTeam(page,teamName)
    console.log(teamId)
    await page.goto(ROUTE_TEAMS)
    await expect(page.locator(`h4:has-text('${teamName}')`)).toBeVisible()
    await deleteTeam(page,teamId)
    await page.goto(ROUTE_TEAMS)
    await expect(page.locator(`h4:has-text('${teamName}')`)).not.toBeVisible()
})*/

const createTeam = async (page: Page, name: string) => {
  await page.goto(ROUTE_TEAMS)
  await page.locator('button:has-text("Add")').click()
  await page.locator('input[id="name"]').fill(name)
  await page.locator('button:has-text("Save")').click()
  await page.locator(`h4:has-text('${name}')`).click()
  await page.waitForURL(`${ROUTE_TEAMS}/**`)
  return page.url().split('/').pop()
}

const deleteTeam = async (page: Page, teamId: string) => {
  await page.goto(teamUrl(teamId))
  await page.locator('button:has-text("Delete")').click()
  await page.waitForSelector('div[data-headlessui-state="open"]')
  await page.locator('button.px-10:has-text("Delete")').click()
  await page.waitForURL(ROUTE_TEAMS)
}
