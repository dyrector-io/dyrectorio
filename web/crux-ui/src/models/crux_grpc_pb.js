// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
// *
// CRUX Protobuf definitions
//
'use strict';
var grpc = require('@grpc/grpc-js');
var crux_pb = require('./crux_pb.js');
var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');

function serialize_crux_CreateDeploymentRequest(arg) {
  if (!(arg instanceof crux_pb.CreateDeploymentRequest)) {
    throw new Error('Expected argument of type crux.CreateDeploymentRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_CreateDeploymentRequest(buffer_arg) {
  return crux_pb.CreateDeploymentRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_CreateEntityResponse(arg) {
  if (!(arg instanceof crux_pb.CreateEntityResponse)) {
    throw new Error('Expected argument of type crux.CreateEntityResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_CreateEntityResponse(buffer_arg) {
  return crux_pb.CreateEntityResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_CreateNodeRequest(arg) {
  if (!(arg instanceof crux_pb.CreateNodeRequest)) {
    throw new Error('Expected argument of type crux.CreateNodeRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_CreateNodeRequest(buffer_arg) {
  return crux_pb.CreateNodeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_CreateOrUpdateTeamRequest(arg) {
  if (!(arg instanceof crux_pb.CreateOrUpdateTeamRequest)) {
    throw new Error('Expected argument of type crux.CreateOrUpdateTeamRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_CreateOrUpdateTeamRequest(buffer_arg) {
  return crux_pb.CreateOrUpdateTeamRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_CreateProductRequest(arg) {
  if (!(arg instanceof crux_pb.CreateProductRequest)) {
    throw new Error('Expected argument of type crux.CreateProductRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_CreateProductRequest(buffer_arg) {
  return crux_pb.CreateProductRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_CreateRegistryRequest(arg) {
  if (!(arg instanceof crux_pb.CreateRegistryRequest)) {
    throw new Error('Expected argument of type crux.CreateRegistryRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_CreateRegistryRequest(buffer_arg) {
  return crux_pb.CreateRegistryRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_CreateRegistryResponse(arg) {
  if (!(arg instanceof crux_pb.CreateRegistryResponse)) {
    throw new Error('Expected argument of type crux.CreateRegistryResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_CreateRegistryResponse(buffer_arg) {
  return crux_pb.CreateRegistryResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_CreateVersionRequest(arg) {
  if (!(arg instanceof crux_pb.CreateVersionRequest)) {
    throw new Error('Expected argument of type crux.CreateVersionRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_CreateVersionRequest(buffer_arg) {
  return crux_pb.CreateVersionRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_DeploymentResponse(arg) {
  if (!(arg instanceof crux_pb.DeploymentResponse)) {
    throw new Error('Expected argument of type crux.DeploymentResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_DeploymentResponse(buffer_arg) {
  return crux_pb.DeploymentResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_Empty(arg) {
  if (!(arg instanceof crux_pb.Empty)) {
    throw new Error('Expected argument of type crux.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_Empty(buffer_arg) {
  return crux_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_IdRequest(arg) {
  if (!(arg instanceof crux_pb.IdRequest)) {
    throw new Error('Expected argument of type crux.IdRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_IdRequest(buffer_arg) {
  return crux_pb.IdRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_IdResponse(arg) {
  if (!(arg instanceof crux_pb.IdResponse)) {
    throw new Error('Expected argument of type crux.IdResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_IdResponse(buffer_arg) {
  return crux_pb.IdResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_NodeEvent(arg) {
  if (!(arg instanceof crux_pb.NodeEvent)) {
    throw new Error('Expected argument of type crux.NodeEvent');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_NodeEvent(buffer_arg) {
  return crux_pb.NodeEvent.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_NodeListResponse(arg) {
  if (!(arg instanceof crux_pb.NodeListResponse)) {
    throw new Error('Expected argument of type crux.NodeListResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_NodeListResponse(buffer_arg) {
  return crux_pb.NodeListResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_NodeScriptResponse(arg) {
  if (!(arg instanceof crux_pb.NodeScriptResponse)) {
    throw new Error('Expected argument of type crux.NodeScriptResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_NodeScriptResponse(buffer_arg) {
  return crux_pb.NodeScriptResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_ProductDetailReponse(arg) {
  if (!(arg instanceof crux_pb.ProductDetailReponse)) {
    throw new Error('Expected argument of type crux.ProductDetailReponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_ProductDetailReponse(buffer_arg) {
  return crux_pb.ProductDetailReponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_ProductListResponse(arg) {
  if (!(arg instanceof crux_pb.ProductListResponse)) {
    throw new Error('Expected argument of type crux.ProductListResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_ProductListResponse(buffer_arg) {
  return crux_pb.ProductListResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_RegistryListResponse(arg) {
  if (!(arg instanceof crux_pb.RegistryListResponse)) {
    throw new Error('Expected argument of type crux.RegistryListResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_RegistryListResponse(buffer_arg) {
  return crux_pb.RegistryListResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_UpdateDeploymentRequest(arg) {
  if (!(arg instanceof crux_pb.UpdateDeploymentRequest)) {
    throw new Error('Expected argument of type crux.UpdateDeploymentRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_UpdateDeploymentRequest(buffer_arg) {
  return crux_pb.UpdateDeploymentRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_UpdateNodeRequest(arg) {
  if (!(arg instanceof crux_pb.UpdateNodeRequest)) {
    throw new Error('Expected argument of type crux.UpdateNodeRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_UpdateNodeRequest(buffer_arg) {
  return crux_pb.UpdateNodeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_UpdateProductRequest(arg) {
  if (!(arg instanceof crux_pb.UpdateProductRequest)) {
    throw new Error('Expected argument of type crux.UpdateProductRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_UpdateProductRequest(buffer_arg) {
  return crux_pb.UpdateProductRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_UpdateProductResponse(arg) {
  if (!(arg instanceof crux_pb.UpdateProductResponse)) {
    throw new Error('Expected argument of type crux.UpdateProductResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_UpdateProductResponse(buffer_arg) {
  return crux_pb.UpdateProductResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_UpdateRegistryRequest(arg) {
  if (!(arg instanceof crux_pb.UpdateRegistryRequest)) {
    throw new Error('Expected argument of type crux.UpdateRegistryRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_UpdateRegistryRequest(buffer_arg) {
  return crux_pb.UpdateRegistryRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_UpdateRegistryResponse(arg) {
  if (!(arg instanceof crux_pb.UpdateRegistryResponse)) {
    throw new Error('Expected argument of type crux.UpdateRegistryResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_UpdateRegistryResponse(buffer_arg) {
  return crux_pb.UpdateRegistryResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_crux_VersionList(arg) {
  if (!(arg instanceof crux_pb.VersionList)) {
    throw new Error('Expected argument of type crux.VersionList');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_crux_VersionList(buffer_arg) {
  return crux_pb.VersionList.deserializeBinary(new Uint8Array(buffer_arg));
}


// *
//
// Services
//
var CruxProductService = exports.CruxProductService = {
  // CRUD
getAllProduct: {
    path: '/crux.CruxProduct/GetAllProduct',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.Empty,
    responseType: crux_pb.ProductListResponse,
    requestSerialize: serialize_crux_Empty,
    requestDeserialize: deserialize_crux_Empty,
    responseSerialize: serialize_crux_ProductListResponse,
    responseDeserialize: deserialize_crux_ProductListResponse,
  },
  getProductsByTeamId: {
    path: '/crux.CruxProduct/GetProductsByTeamId',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.ProductListResponse,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_ProductListResponse,
    responseDeserialize: deserialize_crux_ProductListResponse,
  },
  createProduct: {
    path: '/crux.CruxProduct/CreateProduct',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.CreateProductRequest,
    responseType: crux_pb.CreateEntityResponse,
    requestSerialize: serialize_crux_CreateProductRequest,
    requestDeserialize: deserialize_crux_CreateProductRequest,
    responseSerialize: serialize_crux_CreateEntityResponse,
    responseDeserialize: deserialize_crux_CreateEntityResponse,
  },
  updateProduct: {
    path: '/crux.CruxProduct/UpdateProduct',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.UpdateProductRequest,
    responseType: crux_pb.UpdateProductResponse,
    requestSerialize: serialize_crux_UpdateProductRequest,
    requestDeserialize: deserialize_crux_UpdateProductRequest,
    responseSerialize: serialize_crux_UpdateProductResponse,
    responseDeserialize: deserialize_crux_UpdateProductResponse,
  },
  deleteProduct: {
    path: '/crux.CruxProduct/DeleteProduct',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  getProductDetails: {
    path: '/crux.CruxProduct/GetProductDetails',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.ProductDetailReponse,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_ProductDetailReponse,
    responseDeserialize: deserialize_crux_ProductDetailReponse,
  },
};

exports.CruxProductClient = grpc.makeGenericClientConstructor(CruxProductService);
var CruxRegistryService = exports.CruxRegistryService = {
  // CRUD
getRegistriesByTeam: {
    path: '/crux.CruxRegistry/GetRegistriesByTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.RegistryListResponse,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_RegistryListResponse,
    responseDeserialize: deserialize_crux_RegistryListResponse,
  },
  createRegistry: {
    path: '/crux.CruxRegistry/CreateRegistry',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.CreateRegistryRequest,
    responseType: crux_pb.CreateRegistryResponse,
    requestSerialize: serialize_crux_CreateRegistryRequest,
    requestDeserialize: deserialize_crux_CreateRegistryRequest,
    responseSerialize: serialize_crux_CreateRegistryResponse,
    responseDeserialize: deserialize_crux_CreateRegistryResponse,
  },
  updateRegistry: {
    path: '/crux.CruxRegistry/UpdateRegistry',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.UpdateRegistryRequest,
    responseType: crux_pb.UpdateRegistryResponse,
    requestSerialize: serialize_crux_UpdateRegistryRequest,
    requestDeserialize: deserialize_crux_UpdateRegistryRequest,
    responseSerialize: serialize_crux_UpdateRegistryResponse,
    responseDeserialize: deserialize_crux_UpdateRegistryResponse,
  },
  deleteRegistry: {
    path: '/crux.CruxRegistry/DeleteRegistry',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
};

exports.CruxRegistryClient = grpc.makeGenericClientConstructor(CruxRegistryService);
var CruxNodeService = exports.CruxNodeService = {
  // CRUD
getNodesByTeam: {
    path: '/crux.CruxNode/GetNodesByTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.NodeListResponse,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_NodeListResponse,
    responseDeserialize: deserialize_crux_NodeListResponse,
  },
  createNode: {
    path: '/crux.CruxNode/CreateNode',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.CreateNodeRequest,
    responseType: crux_pb.CreateEntityResponse,
    requestSerialize: serialize_crux_CreateNodeRequest,
    requestDeserialize: deserialize_crux_CreateNodeRequest,
    responseSerialize: serialize_crux_CreateEntityResponse,
    responseDeserialize: deserialize_crux_CreateEntityResponse,
  },
  updateNode: {
    path: '/crux.CruxNode/UpdateNode',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.UpdateNodeRequest,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_UpdateNodeRequest,
    requestDeserialize: deserialize_crux_UpdateNodeRequest,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  deleteNode: {
    path: '/crux.CruxNode/DeleteNode',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  subscribeNodeEventChannel: {
    path: '/crux.CruxNode/SubscribeNodeEventChannel',
    requestStream: false,
    responseStream: true,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.NodeEvent,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_NodeEvent,
    responseDeserialize: deserialize_crux_NodeEvent,
  },
  generateScript: {
    path: '/crux.CruxNode/GenerateScript',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.NodeScriptResponse,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_NodeScriptResponse,
    responseDeserialize: deserialize_crux_NodeScriptResponse,
  },
};

exports.CruxNodeClient = grpc.makeGenericClientConstructor(CruxNodeService);
var CruxProductVersionService = exports.CruxProductVersionService = {
  getVersionsByProductId: {
    path: '/crux.CruxProductVersion/GetVersionsByProductId',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.VersionList,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_VersionList,
    responseDeserialize: deserialize_crux_VersionList,
  },
  createVersion: {
    path: '/crux.CruxProductVersion/CreateVersion',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.CreateVersionRequest,
    responseType: crux_pb.CreateEntityResponse,
    requestSerialize: serialize_crux_CreateVersionRequest,
    requestDeserialize: deserialize_crux_CreateVersionRequest,
    responseSerialize: serialize_crux_CreateEntityResponse,
    responseDeserialize: deserialize_crux_CreateEntityResponse,
  },
};

exports.CruxProductVersionClient = grpc.makeGenericClientConstructor(CruxProductVersionService);
var CruxDeploymentService = exports.CruxDeploymentService = {
  // CRUD
createDeployment: {
    path: '/crux.CruxDeployment/CreateDeployment',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.CreateDeploymentRequest,
    responseType: crux_pb.IdResponse,
    requestSerialize: serialize_crux_CreateDeploymentRequest,
    requestDeserialize: deserialize_crux_CreateDeploymentRequest,
    responseSerialize: serialize_crux_IdResponse,
    responseDeserialize: deserialize_crux_IdResponse,
  },
  updateDeployment: {
    path: '/crux.CruxDeployment/UpdateDeployment',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.UpdateDeploymentRequest,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_UpdateDeploymentRequest,
    requestDeserialize: deserialize_crux_UpdateDeploymentRequest,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  deleteDeployment: {
    path: '/crux.CruxDeployment/DeleteDeployment',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  startDeployment: {
    path: '/crux.CruxDeployment/StartDeployment',
    requestStream: false,
    responseStream: true,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.DeploymentResponse,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_DeploymentResponse,
    responseDeserialize: deserialize_crux_DeploymentResponse,
  },
};

exports.CruxDeploymentClient = grpc.makeGenericClientConstructor(CruxDeploymentService);
var CruxTeamService = exports.CruxTeamService = {
  createTeam: {
    path: '/crux.CruxTeam/CreateTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.CreateOrUpdateTeamRequest,
    responseType: crux_pb.CreateEntityResponse,
    requestSerialize: serialize_crux_CreateOrUpdateTeamRequest,
    requestDeserialize: deserialize_crux_CreateOrUpdateTeamRequest,
    responseSerialize: serialize_crux_CreateEntityResponse,
    responseDeserialize: deserialize_crux_CreateEntityResponse,
  },
  updateTeam: {
    path: '/crux.CruxTeam/UpdateTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.CreateOrUpdateTeamRequest,
    responseType: crux_pb.CreateEntityResponse,
    requestSerialize: serialize_crux_CreateOrUpdateTeamRequest,
    requestDeserialize: deserialize_crux_CreateOrUpdateTeamRequest,
    responseSerialize: serialize_crux_CreateEntityResponse,
    responseDeserialize: deserialize_crux_CreateEntityResponse,
  },
  deleteTeam: {
    path: '/crux.CruxTeam/DeleteTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.IdRequest,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_IdRequest,
    requestDeserialize: deserialize_crux_IdRequest,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  // Registry operations
addRegistryToTeam: {
    path: '/crux.CruxTeam/AddRegistryToTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.Empty,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_Empty,
    requestDeserialize: deserialize_crux_Empty,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  removeRegistryFromTeam: {
    path: '/crux.CruxTeam/RemoveRegistryFromTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.Empty,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_Empty,
    requestDeserialize: deserialize_crux_Empty,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  // Product operations
addProductToTeam: {
    path: '/crux.CruxTeam/AddProductToTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.Empty,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_Empty,
    requestDeserialize: deserialize_crux_Empty,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  removeProductFromTeam: {
    path: '/crux.CruxTeam/RemoveProductFromTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.Empty,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_Empty,
    requestDeserialize: deserialize_crux_Empty,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  // Node operations
addNodeToTeam: {
    path: '/crux.CruxTeam/AddNodeToTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.Empty,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_Empty,
    requestDeserialize: deserialize_crux_Empty,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
  removeNodeFromTeam: {
    path: '/crux.CruxTeam/RemoveNodeFromTeam',
    requestStream: false,
    responseStream: false,
    requestType: crux_pb.Empty,
    responseType: crux_pb.Empty,
    requestSerialize: serialize_crux_Empty,
    requestDeserialize: deserialize_crux_Empty,
    responseSerialize: serialize_crux_Empty,
    responseDeserialize: deserialize_crux_Empty,
  },
};

exports.CruxTeamClient = grpc.makeGenericClientConstructor(CruxTeamService);
