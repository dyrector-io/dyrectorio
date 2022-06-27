// package: crux
// file: crux.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from '@grpc/grpc-js'
import * as crux_pb from './crux_pb'

interface ICruxProductService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getAllProduct: ICruxProductService_IGetAllProduct
  getProductsByTeamId: ICruxProductService_IGetProductsByTeamId
  createProduct: ICruxProductService_ICreateProduct
  updateProduct: ICruxProductService_IUpdateProduct
  deleteProduct: ICruxProductService_IDeleteProduct
  getProductDetails: ICruxProductService_IGetProductDetails
}

interface ICruxProductService_IGetAllProduct extends grpc.MethodDefinition<crux_pb.Empty, crux_pb.ProductListResponse> {
  path: '/crux.CruxProduct/GetAllProduct'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.Empty>
  requestDeserialize: grpc.deserialize<crux_pb.Empty>
  responseSerialize: grpc.serialize<crux_pb.ProductListResponse>
  responseDeserialize: grpc.deserialize<crux_pb.ProductListResponse>
}
interface ICruxProductService_IGetProductsByTeamId
  extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.ProductListResponse> {
  path: '/crux.CruxProduct/GetProductsByTeamId'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.ProductListResponse>
  responseDeserialize: grpc.deserialize<crux_pb.ProductListResponse>
}
interface ICruxProductService_ICreateProduct
  extends grpc.MethodDefinition<crux_pb.CreateProductRequest, crux_pb.CreateEntityResponse> {
  path: '/crux.CruxProduct/CreateProduct'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.CreateProductRequest>
  requestDeserialize: grpc.deserialize<crux_pb.CreateProductRequest>
  responseSerialize: grpc.serialize<crux_pb.CreateEntityResponse>
  responseDeserialize: grpc.deserialize<crux_pb.CreateEntityResponse>
}
interface ICruxProductService_IUpdateProduct
  extends grpc.MethodDefinition<crux_pb.UpdateProductRequest, crux_pb.UpdateProductResponse> {
  path: '/crux.CruxProduct/UpdateProduct'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.UpdateProductRequest>
  requestDeserialize: grpc.deserialize<crux_pb.UpdateProductRequest>
  responseSerialize: grpc.serialize<crux_pb.UpdateProductResponse>
  responseDeserialize: grpc.deserialize<crux_pb.UpdateProductResponse>
}
interface ICruxProductService_IDeleteProduct extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.Empty> {
  path: '/crux.CruxProduct/DeleteProduct'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxProductService_IGetProductDetails
  extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.ProductDetailReponse> {
  path: '/crux.CruxProduct/GetProductDetails'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.ProductDetailReponse>
  responseDeserialize: grpc.deserialize<crux_pb.ProductDetailReponse>
}

export const CruxProductService: ICruxProductService

export interface ICruxProductServer extends grpc.UntypedServiceImplementation {
  getAllProduct: grpc.handleUnaryCall<crux_pb.Empty, crux_pb.ProductListResponse>
  getProductsByTeamId: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.ProductListResponse>
  createProduct: grpc.handleUnaryCall<crux_pb.CreateProductRequest, crux_pb.CreateEntityResponse>
  updateProduct: grpc.handleUnaryCall<crux_pb.UpdateProductRequest, crux_pb.UpdateProductResponse>
  deleteProduct: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.Empty>
  getProductDetails: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.ProductDetailReponse>
}

export interface ICruxProductClient {
  getAllProduct(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  getAllProduct(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  getAllProduct(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  getProductsByTeamId(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  getProductsByTeamId(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  getProductsByTeamId(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  createProduct(
    request: crux_pb.CreateProductRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  createProduct(
    request: crux_pb.CreateProductRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  createProduct(
    request: crux_pb.CreateProductRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  updateProduct(
    request: crux_pb.UpdateProductRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateProductResponse) => void,
  ): grpc.ClientUnaryCall
  updateProduct(
    request: crux_pb.UpdateProductRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateProductResponse) => void,
  ): grpc.ClientUnaryCall
  updateProduct(
    request: crux_pb.UpdateProductRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateProductResponse) => void,
  ): grpc.ClientUnaryCall
  deleteProduct(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteProduct(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteProduct(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  getProductDetails(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductDetailReponse) => void,
  ): grpc.ClientUnaryCall
  getProductDetails(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductDetailReponse) => void,
  ): grpc.ClientUnaryCall
  getProductDetails(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductDetailReponse) => void,
  ): grpc.ClientUnaryCall
}

export class CruxProductClient extends grpc.Client implements ICruxProductClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>)
  public getAllProduct(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  public getAllProduct(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  public getAllProduct(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  public getProductsByTeamId(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  public getProductsByTeamId(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  public getProductsByTeamId(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductListResponse) => void,
  ): grpc.ClientUnaryCall
  public createProduct(
    request: crux_pb.CreateProductRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public createProduct(
    request: crux_pb.CreateProductRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public createProduct(
    request: crux_pb.CreateProductRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public updateProduct(
    request: crux_pb.UpdateProductRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateProductResponse) => void,
  ): grpc.ClientUnaryCall
  public updateProduct(
    request: crux_pb.UpdateProductRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateProductResponse) => void,
  ): grpc.ClientUnaryCall
  public updateProduct(
    request: crux_pb.UpdateProductRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateProductResponse) => void,
  ): grpc.ClientUnaryCall
  public deleteProduct(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteProduct(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteProduct(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public getProductDetails(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductDetailReponse) => void,
  ): grpc.ClientUnaryCall
  public getProductDetails(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductDetailReponse) => void,
  ): grpc.ClientUnaryCall
  public getProductDetails(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.ProductDetailReponse) => void,
  ): grpc.ClientUnaryCall
}

interface ICruxRegistryService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getRegistriesByTeam: ICruxRegistryService_IGetRegistriesByTeam
  createRegistry: ICruxRegistryService_ICreateRegistry
  updateRegistry: ICruxRegistryService_IUpdateRegistry
  deleteRegistry: ICruxRegistryService_IDeleteRegistry
}

interface ICruxRegistryService_IGetRegistriesByTeam
  extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.RegistryListResponse> {
  path: '/crux.CruxRegistry/GetRegistriesByTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.RegistryListResponse>
  responseDeserialize: grpc.deserialize<crux_pb.RegistryListResponse>
}
interface ICruxRegistryService_ICreateRegistry
  extends grpc.MethodDefinition<crux_pb.CreateRegistryRequest, crux_pb.CreateRegistryResponse> {
  path: '/crux.CruxRegistry/CreateRegistry'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.CreateRegistryRequest>
  requestDeserialize: grpc.deserialize<crux_pb.CreateRegistryRequest>
  responseSerialize: grpc.serialize<crux_pb.CreateRegistryResponse>
  responseDeserialize: grpc.deserialize<crux_pb.CreateRegistryResponse>
}
interface ICruxRegistryService_IUpdateRegistry
  extends grpc.MethodDefinition<crux_pb.UpdateRegistryRequest, crux_pb.UpdateRegistryResponse> {
  path: '/crux.CruxRegistry/UpdateRegistry'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.UpdateRegistryRequest>
  requestDeserialize: grpc.deserialize<crux_pb.UpdateRegistryRequest>
  responseSerialize: grpc.serialize<crux_pb.UpdateRegistryResponse>
  responseDeserialize: grpc.deserialize<crux_pb.UpdateRegistryResponse>
}
interface ICruxRegistryService_IDeleteRegistry extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.Empty> {
  path: '/crux.CruxRegistry/DeleteRegistry'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}

export const CruxRegistryService: ICruxRegistryService

export interface ICruxRegistryServer extends grpc.UntypedServiceImplementation {
  getRegistriesByTeam: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.RegistryListResponse>
  createRegistry: grpc.handleUnaryCall<crux_pb.CreateRegistryRequest, crux_pb.CreateRegistryResponse>
  updateRegistry: grpc.handleUnaryCall<crux_pb.UpdateRegistryRequest, crux_pb.UpdateRegistryResponse>
  deleteRegistry: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.Empty>
}

export interface ICruxRegistryClient {
  getRegistriesByTeam(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.RegistryListResponse) => void,
  ): grpc.ClientUnaryCall
  getRegistriesByTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.RegistryListResponse) => void,
  ): grpc.ClientUnaryCall
  getRegistriesByTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.RegistryListResponse) => void,
  ): grpc.ClientUnaryCall
  createRegistry(
    request: crux_pb.CreateRegistryRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  createRegistry(
    request: crux_pb.CreateRegistryRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  createRegistry(
    request: crux_pb.CreateRegistryRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  updateRegistry(
    request: crux_pb.UpdateRegistryRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  updateRegistry(
    request: crux_pb.UpdateRegistryRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  updateRegistry(
    request: crux_pb.UpdateRegistryRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  deleteRegistry(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteRegistry(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteRegistry(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
}

export class CruxRegistryClient extends grpc.Client implements ICruxRegistryClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>)
  public getRegistriesByTeam(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.RegistryListResponse) => void,
  ): grpc.ClientUnaryCall
  public getRegistriesByTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.RegistryListResponse) => void,
  ): grpc.ClientUnaryCall
  public getRegistriesByTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.RegistryListResponse) => void,
  ): grpc.ClientUnaryCall
  public createRegistry(
    request: crux_pb.CreateRegistryRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  public createRegistry(
    request: crux_pb.CreateRegistryRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  public createRegistry(
    request: crux_pb.CreateRegistryRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  public updateRegistry(
    request: crux_pb.UpdateRegistryRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  public updateRegistry(
    request: crux_pb.UpdateRegistryRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  public updateRegistry(
    request: crux_pb.UpdateRegistryRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.UpdateRegistryResponse) => void,
  ): grpc.ClientUnaryCall
  public deleteRegistry(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteRegistry(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteRegistry(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
}

interface ICruxNodeService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getNodesByTeam: ICruxNodeService_IGetNodesByTeam
  createNode: ICruxNodeService_ICreateNode
  updateNode: ICruxNodeService_IUpdateNode
  deleteNode: ICruxNodeService_IDeleteNode
  subscribeNodeEventChannel: ICruxNodeService_ISubscribeNodeEventChannel
  generateScript: ICruxNodeService_IGenerateScript
}

interface ICruxNodeService_IGetNodesByTeam extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.NodeListResponse> {
  path: '/crux.CruxNode/GetNodesByTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.NodeListResponse>
  responseDeserialize: grpc.deserialize<crux_pb.NodeListResponse>
}
interface ICruxNodeService_ICreateNode
  extends grpc.MethodDefinition<crux_pb.CreateNodeRequest, crux_pb.CreateEntityResponse> {
  path: '/crux.CruxNode/CreateNode'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.CreateNodeRequest>
  requestDeserialize: grpc.deserialize<crux_pb.CreateNodeRequest>
  responseSerialize: grpc.serialize<crux_pb.CreateEntityResponse>
  responseDeserialize: grpc.deserialize<crux_pb.CreateEntityResponse>
}
interface ICruxNodeService_IUpdateNode extends grpc.MethodDefinition<crux_pb.UpdateNodeRequest, crux_pb.Empty> {
  path: '/crux.CruxNode/UpdateNode'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.UpdateNodeRequest>
  requestDeserialize: grpc.deserialize<crux_pb.UpdateNodeRequest>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxNodeService_IDeleteNode extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.Empty> {
  path: '/crux.CruxNode/DeleteNode'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxNodeService_ISubscribeNodeEventChannel
  extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.NodeEvent> {
  path: '/crux.CruxNode/SubscribeNodeEventChannel'
  requestStream: false
  responseStream: true
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.NodeEvent>
  responseDeserialize: grpc.deserialize<crux_pb.NodeEvent>
}
interface ICruxNodeService_IGenerateScript
  extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.NodeScriptResponse> {
  path: '/crux.CruxNode/GenerateScript'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.NodeScriptResponse>
  responseDeserialize: grpc.deserialize<crux_pb.NodeScriptResponse>
}

export const CruxNodeService: ICruxNodeService

export interface ICruxNodeServer extends grpc.UntypedServiceImplementation {
  getNodesByTeam: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.NodeListResponse>
  createNode: grpc.handleUnaryCall<crux_pb.CreateNodeRequest, crux_pb.CreateEntityResponse>
  updateNode: grpc.handleUnaryCall<crux_pb.UpdateNodeRequest, crux_pb.Empty>
  deleteNode: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.Empty>
  subscribeNodeEventChannel: grpc.handleServerStreamingCall<crux_pb.IdRequest, crux_pb.NodeEvent>
  generateScript: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.NodeScriptResponse>
}

export interface ICruxNodeClient {
  getNodesByTeam(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeListResponse) => void,
  ): grpc.ClientUnaryCall
  getNodesByTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeListResponse) => void,
  ): grpc.ClientUnaryCall
  getNodesByTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeListResponse) => void,
  ): grpc.ClientUnaryCall
  createNode(
    request: crux_pb.CreateNodeRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  createNode(
    request: crux_pb.CreateNodeRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  createNode(
    request: crux_pb.CreateNodeRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  updateNode(
    request: crux_pb.UpdateNodeRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  updateNode(
    request: crux_pb.UpdateNodeRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  updateNode(
    request: crux_pb.UpdateNodeRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteNode(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteNode(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteNode(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  subscribeNodeEventChannel(
    request: crux_pb.IdRequest,
    options?: Partial<grpc.CallOptions>,
  ): grpc.ClientReadableStream<crux_pb.NodeEvent>
  subscribeNodeEventChannel(
    request: crux_pb.IdRequest,
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>,
  ): grpc.ClientReadableStream<crux_pb.NodeEvent>
  generateScript(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeScriptResponse) => void,
  ): grpc.ClientUnaryCall
  generateScript(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeScriptResponse) => void,
  ): grpc.ClientUnaryCall
  generateScript(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeScriptResponse) => void,
  ): grpc.ClientUnaryCall
}

export class CruxNodeClient extends grpc.Client implements ICruxNodeClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>)
  public getNodesByTeam(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeListResponse) => void,
  ): grpc.ClientUnaryCall
  public getNodesByTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeListResponse) => void,
  ): grpc.ClientUnaryCall
  public getNodesByTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeListResponse) => void,
  ): grpc.ClientUnaryCall
  public createNode(
    request: crux_pb.CreateNodeRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public createNode(
    request: crux_pb.CreateNodeRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public createNode(
    request: crux_pb.CreateNodeRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public updateNode(
    request: crux_pb.UpdateNodeRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public updateNode(
    request: crux_pb.UpdateNodeRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public updateNode(
    request: crux_pb.UpdateNodeRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteNode(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteNode(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteNode(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public subscribeNodeEventChannel(
    request: crux_pb.IdRequest,
    options?: Partial<grpc.CallOptions>,
  ): grpc.ClientReadableStream<crux_pb.NodeEvent>
  public subscribeNodeEventChannel(
    request: crux_pb.IdRequest,
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>,
  ): grpc.ClientReadableStream<crux_pb.NodeEvent>
  public generateScript(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeScriptResponse) => void,
  ): grpc.ClientUnaryCall
  public generateScript(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeScriptResponse) => void,
  ): grpc.ClientUnaryCall
  public generateScript(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.NodeScriptResponse) => void,
  ): grpc.ClientUnaryCall
}

interface ICruxProductVersionService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getVersionsByProductId: ICruxProductVersionService_IGetVersionsByProductId
  createVersion: ICruxProductVersionService_ICreateVersion
}

interface ICruxProductVersionService_IGetVersionsByProductId
  extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.VersionList> {
  path: '/crux.CruxProductVersion/GetVersionsByProductId'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.VersionList>
  responseDeserialize: grpc.deserialize<crux_pb.VersionList>
}
interface ICruxProductVersionService_ICreateVersion
  extends grpc.MethodDefinition<crux_pb.CreateVersionRequest, crux_pb.CreateEntityResponse> {
  path: '/crux.CruxProductVersion/CreateVersion'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.CreateVersionRequest>
  requestDeserialize: grpc.deserialize<crux_pb.CreateVersionRequest>
  responseSerialize: grpc.serialize<crux_pb.CreateEntityResponse>
  responseDeserialize: grpc.deserialize<crux_pb.CreateEntityResponse>
}

export const CruxProductVersionService: ICruxProductVersionService

export interface ICruxProductVersionServer extends grpc.UntypedServiceImplementation {
  getVersionsByProductId: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.VersionList>
  createVersion: grpc.handleUnaryCall<crux_pb.CreateVersionRequest, crux_pb.CreateEntityResponse>
}

export interface ICruxProductVersionClient {
  getVersionsByProductId(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.VersionList) => void,
  ): grpc.ClientUnaryCall
  getVersionsByProductId(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.VersionList) => void,
  ): grpc.ClientUnaryCall
  getVersionsByProductId(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.VersionList) => void,
  ): grpc.ClientUnaryCall
  createVersion(
    request: crux_pb.CreateVersionRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  createVersion(
    request: crux_pb.CreateVersionRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  createVersion(
    request: crux_pb.CreateVersionRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
}

export class CruxProductVersionClient extends grpc.Client implements ICruxProductVersionClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>)
  public getVersionsByProductId(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.VersionList) => void,
  ): grpc.ClientUnaryCall
  public getVersionsByProductId(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.VersionList) => void,
  ): grpc.ClientUnaryCall
  public getVersionsByProductId(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.VersionList) => void,
  ): grpc.ClientUnaryCall
  public createVersion(
    request: crux_pb.CreateVersionRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public createVersion(
    request: crux_pb.CreateVersionRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public createVersion(
    request: crux_pb.CreateVersionRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
}

interface ICruxDeploymentService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  createDeployment: ICruxDeploymentService_ICreateDeployment
  updateDeployment: ICruxDeploymentService_IUpdateDeployment
  deleteDeployment: ICruxDeploymentService_IDeleteDeployment
  startDeployment: ICruxDeploymentService_IStartDeployment
}

interface ICruxDeploymentService_ICreateDeployment
  extends grpc.MethodDefinition<crux_pb.CreateDeploymentRequest, crux_pb.IdResponse> {
  path: '/crux.CruxDeployment/CreateDeployment'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.CreateDeploymentRequest>
  requestDeserialize: grpc.deserialize<crux_pb.CreateDeploymentRequest>
  responseSerialize: grpc.serialize<crux_pb.IdResponse>
  responseDeserialize: grpc.deserialize<crux_pb.IdResponse>
}
interface ICruxDeploymentService_IUpdateDeployment
  extends grpc.MethodDefinition<crux_pb.UpdateDeploymentRequest, crux_pb.Empty> {
  path: '/crux.CruxDeployment/UpdateDeployment'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.UpdateDeploymentRequest>
  requestDeserialize: grpc.deserialize<crux_pb.UpdateDeploymentRequest>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxDeploymentService_IDeleteDeployment extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.Empty> {
  path: '/crux.CruxDeployment/DeleteDeployment'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxDeploymentService_IStartDeployment
  extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.DeploymentResponse> {
  path: '/crux.CruxDeployment/StartDeployment'
  requestStream: false
  responseStream: true
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.DeploymentResponse>
  responseDeserialize: grpc.deserialize<crux_pb.DeploymentResponse>
}

export const CruxDeploymentService: ICruxDeploymentService

export interface ICruxDeploymentServer extends grpc.UntypedServiceImplementation {
  createDeployment: grpc.handleUnaryCall<crux_pb.CreateDeploymentRequest, crux_pb.IdResponse>
  updateDeployment: grpc.handleUnaryCall<crux_pb.UpdateDeploymentRequest, crux_pb.Empty>
  deleteDeployment: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.Empty>
  startDeployment: grpc.handleServerStreamingCall<crux_pb.IdRequest, crux_pb.DeploymentResponse>
}

export interface ICruxDeploymentClient {
  createDeployment(
    request: crux_pb.CreateDeploymentRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.IdResponse) => void,
  ): grpc.ClientUnaryCall
  createDeployment(
    request: crux_pb.CreateDeploymentRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.IdResponse) => void,
  ): grpc.ClientUnaryCall
  createDeployment(
    request: crux_pb.CreateDeploymentRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.IdResponse) => void,
  ): grpc.ClientUnaryCall
  updateDeployment(
    request: crux_pb.UpdateDeploymentRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  updateDeployment(
    request: crux_pb.UpdateDeploymentRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  updateDeployment(
    request: crux_pb.UpdateDeploymentRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteDeployment(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteDeployment(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteDeployment(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  startDeployment(
    request: crux_pb.IdRequest,
    options?: Partial<grpc.CallOptions>,
  ): grpc.ClientReadableStream<crux_pb.DeploymentResponse>
  startDeployment(
    request: crux_pb.IdRequest,
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>,
  ): grpc.ClientReadableStream<crux_pb.DeploymentResponse>
}

export class CruxDeploymentClient extends grpc.Client implements ICruxDeploymentClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>)
  public createDeployment(
    request: crux_pb.CreateDeploymentRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.IdResponse) => void,
  ): grpc.ClientUnaryCall
  public createDeployment(
    request: crux_pb.CreateDeploymentRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.IdResponse) => void,
  ): grpc.ClientUnaryCall
  public createDeployment(
    request: crux_pb.CreateDeploymentRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.IdResponse) => void,
  ): grpc.ClientUnaryCall
  public updateDeployment(
    request: crux_pb.UpdateDeploymentRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public updateDeployment(
    request: crux_pb.UpdateDeploymentRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public updateDeployment(
    request: crux_pb.UpdateDeploymentRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteDeployment(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteDeployment(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteDeployment(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public startDeployment(
    request: crux_pb.IdRequest,
    options?: Partial<grpc.CallOptions>,
  ): grpc.ClientReadableStream<crux_pb.DeploymentResponse>
  public startDeployment(
    request: crux_pb.IdRequest,
    metadata?: grpc.Metadata,
    options?: Partial<grpc.CallOptions>,
  ): grpc.ClientReadableStream<crux_pb.DeploymentResponse>
}

interface ICruxTeamService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  createTeam: ICruxTeamService_ICreateTeam
  updateTeam: ICruxTeamService_IUpdateTeam
  deleteTeam: ICruxTeamService_IDeleteTeam
  addRegistryToTeam: ICruxTeamService_IAddRegistryToTeam
  removeRegistryFromTeam: ICruxTeamService_IRemoveRegistryFromTeam
  addProductToTeam: ICruxTeamService_IAddProductToTeam
  removeProductFromTeam: ICruxTeamService_IRemoveProductFromTeam
  addNodeToTeam: ICruxTeamService_IAddNodeToTeam
  removeNodeFromTeam: ICruxTeamService_IRemoveNodeFromTeam
}

interface ICruxTeamService_ICreateTeam
  extends grpc.MethodDefinition<crux_pb.CreateOrUpdateTeamRequest, crux_pb.CreateEntityResponse> {
  path: '/crux.CruxTeam/CreateTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.CreateOrUpdateTeamRequest>
  requestDeserialize: grpc.deserialize<crux_pb.CreateOrUpdateTeamRequest>
  responseSerialize: grpc.serialize<crux_pb.CreateEntityResponse>
  responseDeserialize: grpc.deserialize<crux_pb.CreateEntityResponse>
}
interface ICruxTeamService_IUpdateTeam
  extends grpc.MethodDefinition<crux_pb.CreateOrUpdateTeamRequest, crux_pb.CreateEntityResponse> {
  path: '/crux.CruxTeam/UpdateTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.CreateOrUpdateTeamRequest>
  requestDeserialize: grpc.deserialize<crux_pb.CreateOrUpdateTeamRequest>
  responseSerialize: grpc.serialize<crux_pb.CreateEntityResponse>
  responseDeserialize: grpc.deserialize<crux_pb.CreateEntityResponse>
}
interface ICruxTeamService_IDeleteTeam extends grpc.MethodDefinition<crux_pb.IdRequest, crux_pb.Empty> {
  path: '/crux.CruxTeam/DeleteTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.IdRequest>
  requestDeserialize: grpc.deserialize<crux_pb.IdRequest>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxTeamService_IAddRegistryToTeam extends grpc.MethodDefinition<crux_pb.Empty, crux_pb.Empty> {
  path: '/crux.CruxTeam/AddRegistryToTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.Empty>
  requestDeserialize: grpc.deserialize<crux_pb.Empty>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxTeamService_IRemoveRegistryFromTeam extends grpc.MethodDefinition<crux_pb.Empty, crux_pb.Empty> {
  path: '/crux.CruxTeam/RemoveRegistryFromTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.Empty>
  requestDeserialize: grpc.deserialize<crux_pb.Empty>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxTeamService_IAddProductToTeam extends grpc.MethodDefinition<crux_pb.Empty, crux_pb.Empty> {
  path: '/crux.CruxTeam/AddProductToTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.Empty>
  requestDeserialize: grpc.deserialize<crux_pb.Empty>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxTeamService_IRemoveProductFromTeam extends grpc.MethodDefinition<crux_pb.Empty, crux_pb.Empty> {
  path: '/crux.CruxTeam/RemoveProductFromTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.Empty>
  requestDeserialize: grpc.deserialize<crux_pb.Empty>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxTeamService_IAddNodeToTeam extends grpc.MethodDefinition<crux_pb.Empty, crux_pb.Empty> {
  path: '/crux.CruxTeam/AddNodeToTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.Empty>
  requestDeserialize: grpc.deserialize<crux_pb.Empty>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}
interface ICruxTeamService_IRemoveNodeFromTeam extends grpc.MethodDefinition<crux_pb.Empty, crux_pb.Empty> {
  path: '/crux.CruxTeam/RemoveNodeFromTeam'
  requestStream: false
  responseStream: false
  requestSerialize: grpc.serialize<crux_pb.Empty>
  requestDeserialize: grpc.deserialize<crux_pb.Empty>
  responseSerialize: grpc.serialize<crux_pb.Empty>
  responseDeserialize: grpc.deserialize<crux_pb.Empty>
}

export const CruxTeamService: ICruxTeamService

export interface ICruxTeamServer extends grpc.UntypedServiceImplementation {
  createTeam: grpc.handleUnaryCall<crux_pb.CreateOrUpdateTeamRequest, crux_pb.CreateEntityResponse>
  updateTeam: grpc.handleUnaryCall<crux_pb.CreateOrUpdateTeamRequest, crux_pb.CreateEntityResponse>
  deleteTeam: grpc.handleUnaryCall<crux_pb.IdRequest, crux_pb.Empty>
  addRegistryToTeam: grpc.handleUnaryCall<crux_pb.Empty, crux_pb.Empty>
  removeRegistryFromTeam: grpc.handleUnaryCall<crux_pb.Empty, crux_pb.Empty>
  addProductToTeam: grpc.handleUnaryCall<crux_pb.Empty, crux_pb.Empty>
  removeProductFromTeam: grpc.handleUnaryCall<crux_pb.Empty, crux_pb.Empty>
  addNodeToTeam: grpc.handleUnaryCall<crux_pb.Empty, crux_pb.Empty>
  removeNodeFromTeam: grpc.handleUnaryCall<crux_pb.Empty, crux_pb.Empty>
}

export interface ICruxTeamClient {
  createTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  createTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  createTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  updateTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  updateTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  updateTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  deleteTeam(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  deleteTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  addRegistryToTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  addRegistryToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  addRegistryToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  removeRegistryFromTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  removeRegistryFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  removeRegistryFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  addProductToTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  addProductToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  addProductToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  removeProductFromTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  removeProductFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  removeProductFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  addNodeToTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  addNodeToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  addNodeToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  removeNodeFromTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  removeNodeFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  removeNodeFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
}

export class CruxTeamClient extends grpc.Client implements ICruxTeamClient {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>)
  public createTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public createTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public createTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public updateTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public updateTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public updateTeam(
    request: crux_pb.CreateOrUpdateTeamRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.CreateEntityResponse) => void,
  ): grpc.ClientUnaryCall
  public deleteTeam(
    request: crux_pb.IdRequest,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public deleteTeam(
    request: crux_pb.IdRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public addRegistryToTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public addRegistryToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public addRegistryToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public removeRegistryFromTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public removeRegistryFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public removeRegistryFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public addProductToTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public addProductToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public addProductToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public removeProductFromTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public removeProductFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public removeProductFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public addNodeToTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public addNodeToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public addNodeToTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public removeNodeFromTeam(
    request: crux_pb.Empty,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public removeNodeFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
  public removeNodeFromTeam(
    request: crux_pb.Empty,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: crux_pb.Empty) => void,
  ): grpc.ClientUnaryCall
}
