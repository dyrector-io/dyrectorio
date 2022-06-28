import { CreateProduct, Product, ProductDetails, ProductType, UpdateProduct, Version } from '@app/models'
import {
  AccessRequest,
  CreateEntityResponse,
  CreateProductRequest,
  CruxProductClient,
  Empty,
  IdRequest,
  ProductDetailsReponse,
  ProductListResponse,
  ProductType as ProtoProductType,
  productTypeFromJSON,
  productTypeToJSON,
  UpdateEntityResponse,
  UpdateProductRequest,
} from '@app/models/grpc/protobuf/proto/crux'
import { timestampToUTC } from '@app/utils'
import { Identity } from '@ory/kratos-client'
import { protomisify } from '@server/crux/grpc-connection'
import { versionTypeToDyo } from './version-service'

class DyoProductService {
  constructor(private client: CruxProductClient, private identity: Identity) {}

  async getAll(): Promise<Product[]> {
    const req: AccessRequest = {
      accessedBy: this.identity.id,
    }

    const products = await protomisify<AccessRequest, ProductListResponse>(this.client, this.client.getProducts)(
      AccessRequest,
      req,
    )

    return products.data.map(it => {
      return {
        ...it,
        type: this.typeToDyo(it.type),
        updatedAt: timestampToUTC(it.audit.updatedAt ?? it.audit.createdAt),
      }
    })
  }

  async getById(id: string): Promise<ProductDetails> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    const res = await protomisify<IdRequest, ProductDetailsReponse>(this.client, this.client.getProductDetails)(
      IdRequest,
      req,
    )

    return {
      ...res,
      type: this.typeToDyo(res.type),
      updatedAt: timestampToUTC(res.audit.updatedAt),
      createdAt: timestampToUTC(res.audit.createdAt),
      versions: res.versions.map(it => {
        return {
          ...it,
          type: versionTypeToDyo(it.type),
          updatedAt: timestampToUTC(it.audit.updatedAt ?? it.audit.createdAt),
        } as Version
      }),
    }
  }

  async create(dto: CreateProduct): Promise<Product> {
    const req: CreateProductRequest = {
      ...dto,
      type: this.typeToProto(dto.type),
      accessedBy: this.identity.id,
    }

    const res = await protomisify<CreateProductRequest, CreateEntityResponse>(this.client, this.client.createProduct)(
      CreateProductRequest,
      req,
    )

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
      accessedBy: this.identity.id,
    }

    const res = await protomisify<UpdateProductRequest, UpdateEntityResponse>(this.client, this.client.updateProduct)(
      UpdateProductRequest,
      req,
    )

    return timestampToUTC(res.updatedAt)
  }

  async delete(id: string): Promise<void> {
    const req: IdRequest = {
      id,
      accessedBy: this.identity.id,
    }

    await protomisify<IdRequest, Empty>(this.client, this.client.deleteProduct)(IdRequest, req)
  }

  private typeToDyo(type: ProtoProductType): ProductType {
    return productTypeToJSON(type).toLowerCase() as ProductType
  }

  private typeToProto(type: ProductType): ProtoProductType {
    return productTypeFromJSON(type.toUpperCase())
  }
}

export default DyoProductService
