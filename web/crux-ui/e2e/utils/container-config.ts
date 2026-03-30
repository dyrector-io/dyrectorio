import { expect, Page } from '@playwright/test'
import { WebSocketRef, wsPatchSent } from './websocket'
import { wsPatchMatchPorts } from './websocket-match'

// eslint-disable-next-line import-x/prefer-default-export
export const addPortsToContainerConfig = async (
  page: Page,
  ws: WebSocketRef,
  wsRoute: string,
  sentWsType: string,
  internal: string,
  external: string,
) => {
  await page.locator('button:has-text("JSON")').click()

  const jsonEditor = await page.locator('textarea')
  const json = JSON.parse(await jsonEditor.inputValue())
  json.ports = [{ internal: Number.parseInt(internal, 10), external: Number.parseInt(external, 10) }]

  const wsSent = wsPatchSent(ws, wsRoute, sentWsType, wsPatchMatchPorts(internal, external))
  await jsonEditor.fill(JSON.stringify(json))
  await wsSent

  await page.reload()

  await expect(page.locator('input[placeholder="Internal"]')).toHaveValue(internal)
  await expect(page.locator('input[placeholder="External"]')).toHaveValue(external)
}
