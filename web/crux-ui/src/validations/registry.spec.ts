import { expect } from '@playwright/test'
import { registrySchema } from './registry' // Import the schema you want to test
import { RegistryDetails } from '@app/models'

const testRegistryDetailsDto: RegistryDetails = {
  id: '4AAF29ED-7BB2-4BC0-9FCC-631E50E2B64E',
  name: 'Test Registry',
  description: 'A test registry',
  icon: 'shark',
  inUse: true,
  updatedAt: '2023-10-11',
  type: 'hub',
  imageNamePrefix: 'library',
}

describe('Registry Schema Validation', () => {
  it('should validate a valid registry', async () => {
    const result = await registrySchema.isValid(testRegistryDetailsDto).catch(err => err)

    expect(result).toBe(true)
  })
})
