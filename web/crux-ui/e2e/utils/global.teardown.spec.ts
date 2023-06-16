import { test } from '@playwright/test'
import { globalTeardown } from './global.teardown'

test('teardown', async () => {
  await globalTeardown()
})
