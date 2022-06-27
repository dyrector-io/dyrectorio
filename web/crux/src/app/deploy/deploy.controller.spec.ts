import { Test, TestingModule } from '@nestjs/testing'
import { DeployController } from './deploy.controller'

describe('DeployController', () => {
  let controller: DeployController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeployController],
    }).compile()

    controller = module.get<DeployController>(DeployController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
