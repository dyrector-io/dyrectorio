// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, Page, WebSocket } from '@playwright/test'
import { wsPatchSent } from './websocket'
import { wsPatchMatchPorts } from './websocket-match'

export const addPortsToContainerConfig = async (
  page: Page,
  ws: WebSocket,
  wsRoute: string,
  sentWsType: string,
  internal: string,
  external: string,
) => {
  await page.locator('button:has-text("JSON")').click()

  const jsonEditor = await page.locator('textarea')
  const json = JSON.parse(await jsonEditor.inputValue())
  json.ports = [{ internal: Number.parseInt(internal,10), external: Number.parseInt(external,10) }]

  let wsSent = wsPatchSent(ws, wsRoute, sentWsType, wsPatchMatchPorts(internal, external))
  jsonEditor.fill(JSON.stringify(json))
  await wsSent

  await page.reload()

  await expect(page.locator('input[placeholder="Internal"]')).toHaveValue(internal)
  await expect(page.locator('input[placeholder="External"]')).toHaveValue(external)
}
