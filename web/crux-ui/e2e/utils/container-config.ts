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
  await page.locator('button:has-text("Ports")').click()

  const addPortsButton = page.locator(`[src="/plus.svg"]:right-of(label:has-text("Ports"))`).first()
  await addPortsButton.click()

  const internalInput = page.locator('input[placeholder="Internal"]')
  const externalInput = page.locator('input[placeholder="External"]')

  let wsSent = wsPatchSent(ws, wsRoute, sentWsType, wsPatchMatchPorts(internal, external))
  await internalInput.fill(internal)
  await externalInput.fill(external)
  await wsSent

  await expect(internalInput).toHaveValue(internal)
  await expect(externalInput).toHaveValue(external)
}
