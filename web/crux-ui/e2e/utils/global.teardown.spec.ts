import { test } from './test.fixture'
import { globalTeardown } from './global.teardown'

test('teardown', async () => {
  await globalTeardown()
})
