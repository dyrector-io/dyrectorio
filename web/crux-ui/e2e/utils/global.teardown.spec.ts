import { test } from '@playwright/test'
import { globalTeardown } from './global.teardown'

test('global teardown', async () => {
  await globalTeardown()
})
