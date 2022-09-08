import { Test, TestingModule } from '@nestjs/testing'
import ProductController from './product.controller'

describe('ProductController', () => {
  let controller: ProductController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
    }).compile()

    controller = module.get<ProductController>(ProductController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('hello', () => {
    expect(1).toEqual(1)
  })
})
