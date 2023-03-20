import { CreateProduct, Product, ProductDetails, UpdateProduct, Version } from '@app/models'
import { Empty } from '@app/models/grpc/protobuf/proto/common'
import {
  CreateEntityResponse,
  CreateProductRequest,
  CruxProductClient,
  IdRequest,
  ProductDetailsReponse,
  ProductListResponse,
  UpdateEntityResponse,
  UpdateProductRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { protomisify } from '@server/crux/grpc-connection'
import { typeToDyo, typeToProto } from './mappers/product-mappers'
import { versionTypeToDyo } from './mappers/version-mappers'

class DyoProductService {
  constructor(private client: CruxProductClient, private cookie: string) {}

  async getAll(): Promise<Product[]> {
    const products = await protomisify<Empty, ProductListResponse>(
      this.client,
      this.client.getProducts,
      this.cookie,
    )(Empty, {})

    return products.data.map(it => ({
      ...it,
      type: typeToDyo(it.type),
      updatedAt: timestampToUTC(it.audit.updatedAt ?? it.audit.createdAt),
    }))
  }

  async getById(id: string): Promise<ProductDetails> {
    const req: IdRequest = {
      id,
    }

    const res = await protomisify<IdRequest, ProductDetailsReponse>(
      this.client,
      this.client.getProductDetails,
      this.cookie,
    )(IdRequest, req)

    return {
      ...res,
      type: typeToDyo(res.type),
      updatedAt: timestampToUTC(res.audit.updatedAt),
      createdAt: timestampToUTC(res.audit.createdAt),
      versions: res.versions.map(
        it =>
          ({
            ...it,
            type: versionTypeToDyo(it.type),
            audit: {
              ...it.audit,
              updatedAt: timestampToUTC(it.audit.updatedAt),
              createdAt: timestampToUTC(it.audit.createdAt),
            },
          } as Version),
      ),
    }
  }

  async create(dto: CreateProduct): Promise<Product> {
    const req: CreateProductRequest = {
      ...dto,
      type: typeToProto(dto.type),
    }

    const res = await protomisify<CreateProductRequest, CreateEntityResponse>(
      this.client,
      this.client.createProduct,
      this.cookie,
    )(CreateProductRequest, req)

    return {
      ...dto,
      id: res.id,
      updatedAt: timestampToUTC(res.createdAt),
    }
  }

  async update(id: string, dto: UpdateProduct): Promise<string> {
    const req: UpdateProductRequest = {
      ...dto,
      id,
    }

    const res = await protomisify<UpdateProductRequest, UpdateEntityResponse>(
      this.client,
      this.client.updateProduct,
      this.cookie,
    )(UpdateProductRequest, req)

    return timestampToUTC(res.updatedAt)
  }

  async delete(id: string): Promise<void> {
    const req: IdRequest = {
      id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteProduct, this.cookie)(IdRequest, req)
  }
}

export default DyoProductService
