// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, Page, WebSocket } from '@playwright/test'
import { wsPatchSent } from './websocket'

export const wsPatchMatchContainerConfigPorts = (internalPort: string, externalPort?: string) => (payload: any) => {
  const internal = Number.parseInt(internalPort, 10)
  const external = Number.parseInt(externalPort, 10)

  return payload.config?.ports?.some(it => it.internal === internal && (!external || it.external === external))
}

export const addPortsToContainerConfig = async (
  page: Page,
  ws: WebSocket,
  wsRoute: string,
  sentWsType: string,
  internal: string,
  external: string,
) => {
  await page.locator('button:has-text("Ports")').click()

  let wsSent = wsPatchSent(ws, sentWsType, wsRoute)
  const addPortsButton = await page.locator(`[src="/plus.svg"]:right-of(label:has-text("Ports"))`).first()
  await addPortsButton.click()
  await wsSent

  const internalInput = page.locator('input[placeholder="Internal"]')
  const externalInput = page.locator('input[placeholder="External"]')

  wsSent = wsPatchSent(ws, wsRoute, sentWsType, wsPatchMatchContainerConfigPorts(internal, external))
  await internalInput.type(internal)
  await externalInput.type(external)
  await wsSent

  await expect(internalInput).toHaveValue(internal)
  await expect(externalInput).toHaveValue(external)
}
