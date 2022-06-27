import { Test, TestingModule } from '@nestjs/testing'
import { DeployService } from './deploy.service'

describe('DeployService', () => {
  let service: DeployService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeployService],
    }).compile()

    service = module.get<DeployService>(DeployService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
