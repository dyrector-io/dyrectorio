// package: crux
// file: crux.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from 'google-protobuf'
import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'

export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): Empty.AsObject
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): Empty
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty
}

export namespace Empty {
  export type AsObject = {}
}

export class IdRequest extends jspb.Message {
  getId(): string
  setId(value: string): IdRequest

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): IdRequest.AsObject
  static toObject(includeInstance: boolean, msg: IdRequest): IdRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: IdRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): IdRequest
  static deserializeBinaryFromReader(message: IdRequest, reader: jspb.BinaryReader): IdRequest
}

export namespace IdRequest {
  export type AsObject = {
    id: string
  }
}

export class IdResponse extends jspb.Message {
  getId(): string
  setId(value: string): IdResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): IdResponse.AsObject
  static toObject(includeInstance: boolean, msg: IdResponse): IdResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: IdResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): IdResponse
  static deserializeBinaryFromReader(message: IdResponse, reader: jspb.BinaryReader): IdResponse
}

export namespace IdResponse {
  export type AsObject = {
    id: string
  }
}

export class CreateEntityResponse extends jspb.Message {
  getId(): string
  setId(value: string): CreateEntityResponse

  hasCreatedat(): boolean
  clearCreatedat(): void
  getCreatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setCreatedat(value?: google_protobuf_timestamp_pb.Timestamp): CreateEntityResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): CreateEntityResponse.AsObject
  static toObject(includeInstance: boolean, msg: CreateEntityResponse): CreateEntityResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: CreateEntityResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): CreateEntityResponse
  static deserializeBinaryFromReader(message: CreateEntityResponse, reader: jspb.BinaryReader): CreateEntityResponse
}

export namespace CreateEntityResponse {
  export type AsObject = {
    id: string
    createdat?: google_protobuf_timestamp_pb.Timestamp.AsObject
  }
}

export class CreateOrUpdateTeamRequest extends jspb.Message {
  getName(): string
  setName(value: string): CreateOrUpdateTeamRequest

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): CreateOrUpdateTeamRequest.AsObject
  static toObject(includeInstance: boolean, msg: CreateOrUpdateTeamRequest): CreateOrUpdateTeamRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: CreateOrUpdateTeamRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): CreateOrUpdateTeamRequest
  static deserializeBinaryFromReader(
    message: CreateOrUpdateTeamRequest,
    reader: jspb.BinaryReader,
  ): CreateOrUpdateTeamRequest
}

export namespace CreateOrUpdateTeamRequest {
  export type AsObject = {
    name: string
  }
}

export class ProductDetailReponse extends jspb.Message {
  getId(): string
  setId(value: string): ProductDetailReponse
  getName(): string
  setName(value: string): ProductDetailReponse
  getDescription(): string
  setDescription(value: string): ProductDetailReponse
  getType(): ProductType
  setType(value: ProductType): ProductDetailReponse

  hasCreatedat(): boolean
  clearCreatedat(): void
  getCreatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setCreatedat(value?: google_protobuf_timestamp_pb.Timestamp): ProductDetailReponse
  getCreatedby(): string
  setCreatedby(value: string): ProductDetailReponse

  hasUpdatedat(): boolean
  clearUpdatedat(): void
  getUpdatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setUpdatedat(value?: google_protobuf_timestamp_pb.Timestamp): ProductDetailReponse
  getUpdatedby(): string
  setUpdatedby(value: string): ProductDetailReponse
  clearVersionsList(): void
  getVersionsList(): Array<VersionResponse>
  setVersionsList(value: Array<VersionResponse>): ProductDetailReponse
  addVersions(value?: VersionResponse, index?: number): VersionResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): ProductDetailReponse.AsObject
  static toObject(includeInstance: boolean, msg: ProductDetailReponse): ProductDetailReponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: ProductDetailReponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): ProductDetailReponse
  static deserializeBinaryFromReader(message: ProductDetailReponse, reader: jspb.BinaryReader): ProductDetailReponse
}

export namespace ProductDetailReponse {
  export type AsObject = {
    id: string
    name: string
    description: string
    type: ProductType
    createdat?: google_protobuf_timestamp_pb.Timestamp.AsObject
    createdby: string
    updatedat?: google_protobuf_timestamp_pb.Timestamp.AsObject
    updatedby: string
    versionsList: Array<VersionResponse.AsObject>
  }
}

export class ProductReponse extends jspb.Message {
  getId(): string
  setId(value: string): ProductReponse
  getName(): string
  setName(value: string): ProductReponse
  getDescription(): string
  setDescription(value: string): ProductReponse
  getType(): ProductType
  setType(value: ProductType): ProductReponse

  hasCreatedat(): boolean
  clearCreatedat(): void
  getCreatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setCreatedat(value?: google_protobuf_timestamp_pb.Timestamp): ProductReponse
  getCreatedby(): string
  setCreatedby(value: string): ProductReponse

  hasUpdatedat(): boolean
  clearUpdatedat(): void
  getUpdatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setUpdatedat(value?: google_protobuf_timestamp_pb.Timestamp): ProductReponse
  getUpdatedby(): string
  setUpdatedby(value: string): ProductReponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): ProductReponse.AsObject
  static toObject(includeInstance: boolean, msg: ProductReponse): ProductReponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: ProductReponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): ProductReponse
  static deserializeBinaryFromReader(message: ProductReponse, reader: jspb.BinaryReader): ProductReponse
}

export namespace ProductReponse {
  export type AsObject = {
    id: string
    name: string
    description: string
    type: ProductType
    createdat?: google_protobuf_timestamp_pb.Timestamp.AsObject
    createdby: string
    updatedat?: google_protobuf_timestamp_pb.Timestamp.AsObject
    updatedby: string
  }
}

export class ProductListResponse extends jspb.Message {
  clearDataList(): void
  getDataList(): Array<ProductReponse>
  setDataList(value: Array<ProductReponse>): ProductListResponse
  addData(value?: ProductReponse, index?: number): ProductReponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): ProductListResponse.AsObject
  static toObject(includeInstance: boolean, msg: ProductListResponse): ProductListResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: ProductListResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): ProductListResponse
  static deserializeBinaryFromReader(message: ProductListResponse, reader: jspb.BinaryReader): ProductListResponse
}

export namespace ProductListResponse {
  export type AsObject = {
    dataList: Array<ProductReponse.AsObject>
  }
}

export class CreateProductRequest extends jspb.Message {
  getName(): string
  setName(value: string): CreateProductRequest
  getDescription(): string
  setDescription(value: string): CreateProductRequest
  getType(): ProductType
  setType(value: ProductType): CreateProductRequest
  getCreatedby(): string
  setCreatedby(value: string): CreateProductRequest

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): CreateProductRequest.AsObject
  static toObject(includeInstance: boolean, msg: CreateProductRequest): CreateProductRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: CreateProductRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): CreateProductRequest
  static deserializeBinaryFromReader(message: CreateProductRequest, reader: jspb.BinaryReader): CreateProductRequest
}

export namespace CreateProductRequest {
  export type AsObject = {
    name: string
    description: string
    type: ProductType
    createdby: string
  }
}

export class UpdateProductRequest extends jspb.Message {
  getId(): string
  setId(value: string): UpdateProductRequest
  getName(): string
  setName(value: string): UpdateProductRequest
  getDescription(): string
  setDescription(value: string): UpdateProductRequest
  getUpdatedby(): string
  setUpdatedby(value: string): UpdateProductRequest

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): UpdateProductRequest.AsObject
  static toObject(includeInstance: boolean, msg: UpdateProductRequest): UpdateProductRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: UpdateProductRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): UpdateProductRequest
  static deserializeBinaryFromReader(message: UpdateProductRequest, reader: jspb.BinaryReader): UpdateProductRequest
}

export namespace UpdateProductRequest {
  export type AsObject = {
    id: string
    name: string
    description: string
    updatedby: string
  }
}

export class UpdateProductResponse extends jspb.Message {
  hasUpdatedat(): boolean
  clearUpdatedat(): void
  getUpdatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setUpdatedat(value?: google_protobuf_timestamp_pb.Timestamp): UpdateProductResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): UpdateProductResponse.AsObject
  static toObject(includeInstance: boolean, msg: UpdateProductResponse): UpdateProductResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: UpdateProductResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): UpdateProductResponse
  static deserializeBinaryFromReader(message: UpdateProductResponse, reader: jspb.BinaryReader): UpdateProductResponse
}

export namespace UpdateProductResponse {
  export type AsObject = {
    updatedat?: google_protobuf_timestamp_pb.Timestamp.AsObject
  }
}

export class RegistryResponse extends jspb.Message {
  getId(): string
  setId(value: string): RegistryResponse

  hasCreatedat(): boolean
  clearCreatedat(): void
  getCreatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setCreatedat(value?: google_protobuf_timestamp_pb.Timestamp): RegistryResponse
  getCreatedby(): string
  setCreatedby(value: string): RegistryResponse

  hasUpdatedat(): boolean
  clearUpdatedat(): void
  getUpdatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setUpdatedat(value?: google_protobuf_timestamp_pb.Timestamp): RegistryResponse
  getUpdatedby(): string
  setUpdatedby(value: string): RegistryResponse
  getName(): string
  setName(value: string): RegistryResponse
  getDescription(): string
  setDescription(value: string): RegistryResponse
  getIcon(): string
  setIcon(value: string): RegistryResponse
  getUrl(): string
  setUrl(value: string): RegistryResponse
  getUser(): string
  setUser(value: string): RegistryResponse
  getToken(): string
  setToken(value: string): RegistryResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): RegistryResponse.AsObject
  static toObject(includeInstance: boolean, msg: RegistryResponse): RegistryResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: RegistryResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): RegistryResponse
  static deserializeBinaryFromReader(message: RegistryResponse, reader: jspb.BinaryReader): RegistryResponse
}

export namespace RegistryResponse {
  export type AsObject = {
    id: string
    createdat?: google_protobuf_timestamp_pb.Timestamp.AsObject
    createdby: string
    updatedat?: google_protobuf_timestamp_pb.Timestamp.AsObject
    updatedby: string
    name: string
    description: string
    icon: string
    url: string
    user: string
    token: string
  }
}

export class RegistryListResponse extends jspb.Message {
  clearDataList(): void
  getDataList(): Array<RegistryResponse>
  setDataList(value: Array<RegistryResponse>): RegistryListResponse
  addData(value?: RegistryResponse, index?: number): RegistryResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): RegistryListResponse.AsObject
  static toObject(includeInstance: boolean, msg: RegistryListResponse): RegistryListResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: RegistryListResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): RegistryListResponse
  static deserializeBinaryFromReader(message: RegistryListResponse, reader: jspb.BinaryReader): RegistryListResponse
}

export namespace RegistryListResponse {
  export type AsObject = {
    dataList: Array<RegistryResponse.AsObject>
  }
}

export class CreateRegistryRequest extends jspb.Message {
  getCreatedby(): string
  setCreatedby(value: string): CreateRegistryRequest
  getName(): string
  setName(value: string): CreateRegistryRequest
  getDescription(): string
  setDescription(value: string): CreateRegistryRequest
  getIcon(): string
  setIcon(value: string): CreateRegistryRequest
  getUrl(): string
  setUrl(value: string): CreateRegistryRequest
  getUser(): string
  setUser(value: string): CreateRegistryRequest
  getToken(): string
  setToken(value: string): CreateRegistryRequest

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): CreateRegistryRequest.AsObject
  static toObject(includeInstance: boolean, msg: CreateRegistryRequest): CreateRegistryRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: CreateRegistryRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): CreateRegistryRequest
  static deserializeBinaryFromReader(message: CreateRegistryRequest, reader: jspb.BinaryReader): CreateRegistryRequest
}

export namespace CreateRegistryRequest {
  export type AsObject = {
    createdby: string
    name: string
    description: string
    icon: string
    url: string
    user: string
    token: string
  }
}

export class CreateRegistryResponse extends jspb.Message {
  getId(): string
  setId(value: string): CreateRegistryResponse

  hasCreatedat(): boolean
  clearCreatedat(): void
  getCreatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setCreatedat(value?: google_protobuf_timestamp_pb.Timestamp): CreateRegistryResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): CreateRegistryResponse.AsObject
  static toObject(includeInstance: boolean, msg: CreateRegistryResponse): CreateRegistryResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: CreateRegistryResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): CreateRegistryResponse
  static deserializeBinaryFromReader(message: CreateRegistryResponse, reader: jspb.BinaryReader): CreateRegistryResponse
}

export namespace CreateRegistryResponse {
  export type AsObject = {
    id: string
    createdat?: google_protobuf_timestamp_pb.Timestamp.AsObject
  }
}

export class UpdateRegistryRequest extends jspb.Message {
  getId(): string
  setId(value: string): UpdateRegistryRequest
  getName(): string
  setName(value: string): UpdateRegistryRequest
  getDescription(): string
  setDescription(value: string): UpdateRegistryRequest
  getIcon(): string
  setIcon(value: string): UpdateRegistryRequest
  getUrl(): string
  setUrl(value: string): UpdateRegistryRequest
  getUser(): string
  setUser(value: string): UpdateRegistryRequest
  getToken(): string
  setToken(value: string): UpdateRegistryRequest
  getUpdatedby(): string
  setUpdatedby(value: string): UpdateRegistryRequest

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): UpdateRegistryRequest.AsObject
  static toObject(includeInstance: boolean, msg: UpdateRegistryRequest): UpdateRegistryRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: UpdateRegistryRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): UpdateRegistryRequest
  static deserializeBinaryFromReader(message: UpdateRegistryRequest, reader: jspb.BinaryReader): UpdateRegistryRequest
}

export namespace UpdateRegistryRequest {
  export type AsObject = {
    id: string
    name: string
    description: string
    icon: string
    url: string
    user: string
    token: string
    updatedby: string
  }
}

export class UpdateRegistryResponse extends jspb.Message {
  hasUpdatedat(): boolean
  clearUpdatedat(): void
  getUpdatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setUpdatedat(value?: google_protobuf_timestamp_pb.Timestamp): UpdateRegistryResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): UpdateRegistryResponse.AsObject
  static toObject(includeInstance: boolean, msg: UpdateRegistryResponse): UpdateRegistryResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: UpdateRegistryResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): UpdateRegistryResponse
  static deserializeBinaryFromReader(message: UpdateRegistryResponse, reader: jspb.BinaryReader): UpdateRegistryResponse
}

export namespace UpdateRegistryResponse {
  export type AsObject = {
    updatedat?: google_protobuf_timestamp_pb.Timestamp.AsObject
  }
}

export class CreateVersionRequest extends jspb.Message {
  getName(): string
  setName(value: string): CreateVersionRequest
  getChangelog(): string
  setChangelog(value: string): CreateVersionRequest
  getProductid(): string
  setProductid(value: string): CreateVersionRequest
  getType(): VersionType
  setType(value: VersionType): CreateVersionRequest
  getDefault(): boolean
  setDefault(value: boolean): CreateVersionRequest
  getCreatedby(): string
  setCreatedby(value: string): CreateVersionRequest

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): CreateVersionRequest.AsObject
  static toObject(includeInstance: boolean, msg: CreateVersionRequest): CreateVersionRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: CreateVersionRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): CreateVersionRequest
  static deserializeBinaryFromReader(message: CreateVersionRequest, reader: jspb.BinaryReader): CreateVersionRequest
}

export namespace CreateVersionRequest {
  export type AsObject = {
    name: string
    changelog: string
    productid: string
    type: VersionType
    pb_default: boolean
    createdby: string
  }
}

export class VersionResponse extends jspb.Message {
  getId(): string
  setId(value: string): VersionResponse
  getName(): string
  setName(value: string): VersionResponse
  getChangelog(): string
  setChangelog(value: string): VersionResponse
  getType(): VersionType
  setType(value: VersionType): VersionResponse
  getDefault(): boolean
  setDefault(value: boolean): VersionResponse

  hasCreatedat(): boolean
  clearCreatedat(): void
  getCreatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setCreatedat(value?: google_protobuf_timestamp_pb.Timestamp): VersionResponse
  getCreatedby(): string
  setCreatedby(value: string): VersionResponse

  hasUpdatedat(): boolean
  clearUpdatedat(): void
  getUpdatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setUpdatedat(value?: google_protobuf_timestamp_pb.Timestamp): VersionResponse
  getUpdatedby(): string
  setUpdatedby(value: string): VersionResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): VersionResponse.AsObject
  static toObject(includeInstance: boolean, msg: VersionResponse): VersionResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: VersionResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): VersionResponse
  static deserializeBinaryFromReader(message: VersionResponse, reader: jspb.BinaryReader): VersionResponse
}

export namespace VersionResponse {
  export type AsObject = {
    id: string
    name: string
    changelog: string
    type: VersionType
    pb_default: boolean
    createdat?: google_protobuf_timestamp_pb.Timestamp.AsObject
    createdby: string
    updatedat?: google_protobuf_timestamp_pb.Timestamp.AsObject
    updatedby: string
  }
}

export class VersionList extends jspb.Message {
  clearDataList(): void
  getDataList(): Array<VersionResponse>
  setDataList(value: Array<VersionResponse>): VersionList
  addData(value?: VersionResponse, index?: number): VersionResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): VersionList.AsObject
  static toObject(includeInstance: boolean, msg: VersionList): VersionList.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: VersionList, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): VersionList
  static deserializeBinaryFromReader(message: VersionList, reader: jspb.BinaryReader): VersionList
}

export namespace VersionList {
  export type AsObject = {
    dataList: Array<VersionResponse.AsObject>
  }
}

export class NodeListResponse extends jspb.Message {
  clearDataList(): void
  getDataList(): Array<NodeListResponse.NodeResponse>
  setDataList(value: Array<NodeListResponse.NodeResponse>): NodeListResponse
  addData(value?: NodeListResponse.NodeResponse, index?: number): NodeListResponse.NodeResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): NodeListResponse.AsObject
  static toObject(includeInstance: boolean, msg: NodeListResponse): NodeListResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: NodeListResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): NodeListResponse
  static deserializeBinaryFromReader(message: NodeListResponse, reader: jspb.BinaryReader): NodeListResponse
}

export namespace NodeListResponse {
  export type AsObject = {
    dataList: Array<NodeListResponse.NodeResponse.AsObject>
  }

  export class NodeResponse extends jspb.Message {
    getId(): string
    setId(value: string): NodeResponse
    getName(): string
    setName(value: string): NodeResponse
    getDescription(): string
    setDescription(value: string): NodeResponse
    getIcon(): string
    setIcon(value: string): NodeResponse
    getAddress(): string
    setAddress(value: string): NodeResponse
    getStatus(): NodeConnectionStatus
    setStatus(value: NodeConnectionStatus): NodeResponse

    hasCreatedat(): boolean
    clearCreatedat(): void
    getCreatedat(): google_protobuf_timestamp_pb.Timestamp | undefined
    setCreatedat(value?: google_protobuf_timestamp_pb.Timestamp): NodeResponse

    serializeBinary(): Uint8Array
    toObject(includeInstance?: boolean): NodeResponse.AsObject
    static toObject(includeInstance: boolean, msg: NodeResponse): NodeResponse.AsObject
    static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
    static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
    static serializeBinaryToWriter(message: NodeResponse, writer: jspb.BinaryWriter): void
    static deserializeBinary(bytes: Uint8Array): NodeResponse
    static deserializeBinaryFromReader(message: NodeResponse, reader: jspb.BinaryReader): NodeResponse
  }

  export namespace NodeResponse {
    export type AsObject = {
      id: string
      name: string
      description: string
      icon: string
      address: string
      status: NodeConnectionStatus
      createdat?: google_protobuf_timestamp_pb.Timestamp.AsObject
    }
  }
}

export class CreateNodeRequest extends jspb.Message {
  getName(): string
  setName(value: string): CreateNodeRequest
  getDescription(): string
  setDescription(value: string): CreateNodeRequest
  getIcon(): string
  setIcon(value: string): CreateNodeRequest
  getCreatedby(): string
  setCreatedby(value: string): CreateNodeRequest
  getAddress(): string
  setAddress(value: string): CreateNodeRequest
  getKeyfilepath(): string
  setKeyfilepath(value: string): CreateNodeRequest
  getCertfilepath(): string
  setCertfilepath(value: string): CreateNodeRequest

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): CreateNodeRequest.AsObject
  static toObject(includeInstance: boolean, msg: CreateNodeRequest): CreateNodeRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: CreateNodeRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): CreateNodeRequest
  static deserializeBinaryFromReader(message: CreateNodeRequest, reader: jspb.BinaryReader): CreateNodeRequest
}

export namespace CreateNodeRequest {
  export type AsObject = {
    name: string
    description: string
    icon: string
    createdby: string
    address: string
    keyfilepath: string
    certfilepath: string
  }
}

export class UpdateNodeRequest extends jspb.Message {
  getId(): string
  setId(value: string): UpdateNodeRequest
  getName(): string
  setName(value: string): UpdateNodeRequest
  getDescription(): string
  setDescription(value: string): UpdateNodeRequest
  getIcon(): string
  setIcon(value: string): UpdateNodeRequest
  getAddress(): string
  setAddress(value: string): UpdateNodeRequest

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): UpdateNodeRequest.AsObject
  static toObject(includeInstance: boolean, msg: UpdateNodeRequest): UpdateNodeRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: UpdateNodeRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): UpdateNodeRequest
  static deserializeBinaryFromReader(message: UpdateNodeRequest, reader: jspb.BinaryReader): UpdateNodeRequest
}

export namespace UpdateNodeRequest {
  export type AsObject = {
    id: string
    name: string
    description: string
    icon: string
    address: string
  }
}

export class NodeScriptResponse extends jspb.Message {
  getContent(): string
  setContent(value: string): NodeScriptResponse

  hasExpiresat(): boolean
  clearExpiresat(): void
  getExpiresat(): google_protobuf_timestamp_pb.Timestamp | undefined
  setExpiresat(value?: google_protobuf_timestamp_pb.Timestamp): NodeScriptResponse

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): NodeScriptResponse.AsObject
  static toObject(includeInstance: boolean, msg: NodeScriptResponse): NodeScriptResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: NodeScriptResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): NodeScriptResponse
  static deserializeBinaryFromReader(message: NodeScriptResponse, reader: jspb.BinaryReader): NodeScriptResponse
}

export namespace NodeScriptResponse {
  export type AsObject = {
    content: string
    expiresat?: google_protobuf_timestamp_pb.Timestamp.AsObject
  }
}

export class NodeEvent extends jspb.Message {
  getId(): string
  setId(value: string): NodeEvent
  getStatus(): NodeConnectionStatus
  setStatus(value: NodeConnectionStatus): NodeEvent

  hasEmpty(): boolean
  clearEmpty(): void
  getEmpty(): Empty | undefined
  setEmpty(value?: Empty): NodeEvent

  hasAddress(): boolean
  clearAddress(): void
  getAddress(): string
  setAddress(value: string): NodeEvent

  getDetailsCase(): NodeEvent.DetailsCase

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): NodeEvent.AsObject
  static toObject(includeInstance: boolean, msg: NodeEvent): NodeEvent.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: NodeEvent, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): NodeEvent
  static deserializeBinaryFromReader(message: NodeEvent, reader: jspb.BinaryReader): NodeEvent
}

export namespace NodeEvent {
  export type AsObject = {
    id: string
    status: NodeConnectionStatus
    empty?: Empty.AsObject
    address: string
  }

  export enum DetailsCase {
    DETAILS_NOT_SET = 0,
    EMPTY = 3,
    ADDRESS = 4,
  }
}

export class CreateDeploymentRequest extends jspb.Message {
  getProductversionid(): string
  setProductversionid(value: string): CreateDeploymentRequest
  getNodeid(): string
  setNodeid(value: string): CreateDeploymentRequest
  getName(): string
  setName(value: string): CreateDeploymentRequest
  getDescripion(): string
  setDescripion(value: string): CreateDeploymentRequest
  getPrefix(): string
  setPrefix(value: string): CreateDeploymentRequest

  getEnvironmentMap(): jspb.Map<string, string>
  clearEnvironmentMap(): void

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): CreateDeploymentRequest.AsObject
  static toObject(includeInstance: boolean, msg: CreateDeploymentRequest): CreateDeploymentRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: CreateDeploymentRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): CreateDeploymentRequest
  static deserializeBinaryFromReader(
    message: CreateDeploymentRequest,
    reader: jspb.BinaryReader,
  ): CreateDeploymentRequest
}

export namespace CreateDeploymentRequest {
  export type AsObject = {
    productversionid: string
    nodeid: string
    name: string
    descripion: string
    prefix: string

    environmentMap: Array<[string, string]>
  }
}

export class UpdateDeploymentRequest extends jspb.Message {
  getId(): string
  setId(value: string): UpdateDeploymentRequest
  getNodeid(): string
  setNodeid(value: string): UpdateDeploymentRequest
  getName(): string
  setName(value: string): UpdateDeploymentRequest
  getDescripion(): string
  setDescripion(value: string): UpdateDeploymentRequest
  getPrefix(): string
  setPrefix(value: string): UpdateDeploymentRequest

  getEnvironmentMap(): jspb.Map<string, string>
  clearEnvironmentMap(): void

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): UpdateDeploymentRequest.AsObject
  static toObject(includeInstance: boolean, msg: UpdateDeploymentRequest): UpdateDeploymentRequest.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: UpdateDeploymentRequest, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): UpdateDeploymentRequest
  static deserializeBinaryFromReader(
    message: UpdateDeploymentRequest,
    reader: jspb.BinaryReader,
  ): UpdateDeploymentRequest
}

export namespace UpdateDeploymentRequest {
  export type AsObject = {
    id: string
    nodeid: string
    name: string
    descripion: string
    prefix: string

    environmentMap: Array<[string, string]>
  }
}

export class DeploymentResponse extends jspb.Message {
  getId(): string
  setId(value: string): DeploymentResponse
  getStatus(): DeploymentStatus
  setStatus(value: DeploymentStatus): DeploymentResponse
  clearLogList(): void
  getLogList(): Array<string>
  setLogList(value: Array<string>): DeploymentResponse
  addLog(value: string, index?: number): string

  serializeBinary(): Uint8Array
  toObject(includeInstance?: boolean): DeploymentResponse.AsObject
  static toObject(includeInstance: boolean, msg: DeploymentResponse): DeploymentResponse.AsObject
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> }
  static extensionsBinary: { [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message> }
  static serializeBinaryToWriter(message: DeploymentResponse, writer: jspb.BinaryWriter): void
  static deserializeBinary(bytes: Uint8Array): DeploymentResponse
  static deserializeBinaryFromReader(message: DeploymentResponse, reader: jspb.BinaryReader): DeploymentResponse
}

export namespace DeploymentResponse {
  export type AsObject = {
    id: string
    status: DeploymentStatus
    logList: Array<string>
  }
}

export enum ProductType {
  UNKNOWN_PRODUCT_TYPE = 0,
  SIMPLE = 1,
  COMPLEX = 2,
}

export enum VersionType {
  UNKNOWN_VERSION_TYPE = 0,
  INCREMENTAL = 1,
  ROLLING = 2,
}

export enum NodeConnectionStatus {
  UNKNOWN_CONNECTION_STATUS = 0,
  UNREACHABLE = 1,
  CONNECTED = 2,
}

export enum DeploymentStatus {
  UNKNOWN_DEPLOYMENT_STATUS = 0,
  UNSENT = 1,
  RUNNING = 2,
  FAILED = 3,
  SUCCESSFUL = 4,
}
