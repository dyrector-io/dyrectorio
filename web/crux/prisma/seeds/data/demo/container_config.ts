import { ContainerConfig } from '@prisma/client'
import { ImageName } from './images'
import { v4 as uuidv4 } from 'uuid'

export const buildContainerConfig = (imageId: string, name: ImageName) => {
  const imageConfig = mapConfigToImage(name)
  return {
    name: name,
    capabilities: [],
    config: imageConfig.config,
    environment: imageConfig.environment,
    imageId: imageId,
  } as Omit<ContainerConfig, 'id'>
}

type Environment = {
  id: string
  key: string
  value: string
}

enum NetworkMode {
  NONE = 1,
  HOST = 2,
  BRIDGE = 3,
}

const dagentNetwork = { networkMode: NetworkMode.BRIDGE, networks: ['googlemicroservicesdemo'] }

const mapConfigToImage = (name: ImageName) => {
  const config =
    name == ImageName.Adservice
      ? {
          environment: [
            { key: 'PORT', value: '9555' },
            { key: 'DISABLE_STATS', value: '1' },
            { key: 'DISABLE_TRACING', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 9555, internal: 9555 }], dagent: dagentNetwork },
        }
      : name == ImageName.Cartservice
      ? {
          environment: [{ key: 'REDIS_ADDR', value: 'redis:6379' }] as Environment[],
          config: { ports: [{ external: 7070, internal: 7070 }], dagent: dagentNetwork },
        }
      : name == ImageName.Checkoutservice
      ? {
          environment: [
            { key: 'PORT', value: '5050' },
            { key: 'PRODUCT_CATALOG_SERVICE_ADDR', value: 'productcatalogservice:3550' },
            { key: 'SHIPPING_SERVICE_ADDR', value: 'shippingservice:50054' },
            { key: 'PAYMENT_SERVICE_ADDR', value: 'paymentservice:50051' },
            { key: 'EMAIL_SERVICE_ADDR', value: 'emailservice:50052' },
            { key: 'CURRENCY_SERVICE_ADDR', value: 'currencyservice:7000' },
            { key: 'CART_SERVICE_ADDR', value: 'cartservice:7070' },
            { key: 'DISABLE_STATS', value: '1' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 5050, internal: 5050 }], dagent: dagentNetwork },
        }
      : name == ImageName.Currencyservice
      ? {
          environment: [
            { key: 'PORT', value: '7000' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
            { key: 'DISABLE_DEBUGGER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 7000, internal: 7000 }], dagent: dagentNetwork },
        }
      : name == ImageName.Emailservice
      ? {
          environment: [
            { key: 'PORT', value: '50052' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 50052, internal: 50052 }], dagent: dagentNetwork },
        }
      : name == ImageName.Frontend
      ? {
          environment: [
            { key: 'PORT', value: '65534' },
            { key: 'PRODUCT_CATALOG_SERVICE_ADDR', value: 'productcatalogservice:3550' },
            { key: 'CURRENCY_SERVICE_ADDR', value: 'currencyservice:7000' },
            { key: 'CART_SERVICE_ADDR', value: 'cartservice:7070' },
            { key: 'RECOMMENDATION_SERVICE_ADDR', value: 'recommendationservice:50053' },
            { key: 'SHIPPING_SERVICE_ADDR', value: 'shippingservice:50054' },
            { key: 'CHECKOUT_SERVICE_ADDR', value: 'checkoutservice:5050' },
            { key: 'AD_SERVICE_ADDR', value: 'adservice:9555' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 65534, internal: 65534 }], dagent: dagentNetwork },
        }
      : name == ImageName.Loadgenerator
      ? {
          environment: [
            { key: 'FRONTEND_ADDR', value: 'frontend:65534' },
            { key: 'USERS', value: '10' },
          ] as Environment[],
          config: { dagent: dagentNetwork },
        }
      : name == ImageName.Paymentservice
      ? {
          environment: [
            { key: 'PORT', value: '50051' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
            { key: 'DISABLE_DEBUGGER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 50051, internal: 50051 }], dagent: dagentNetwork },
        }
      : name == ImageName.Productcatalogservice
      ? {
          environment: [
            { key: 'PORT', value: '3550' },
            { key: 'DISABLE_STATS', value: '1' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 3550, internal: 3550 }], dagent: dagentNetwork },
        }
      : name == ImageName.Recommendationservice
      ? {
          environment: [
            { key: 'PORT', value: '50053' },
            { key: 'PRODUCT_CATALOG_SERVICE_ADDR', value: 'productcatalogservice:3550' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
            { key: 'DISABLE_DEBUGGER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 50053, internal: 50053 }], dagent: dagentNetwork },
        }
      : name == ImageName.Shippingservice
      ? {
          environment: [
            { key: 'PORT', value: '50054' },
            { key: 'DISABLE_STATS', value: '1' },
            { key: 'DISABLE_TRACING', value: '1' },
            { key: 'DISABLE_PROFILER', value: '1' },
          ] as Environment[],
          config: { ports: [{ external: 50054, internal: 50054 }], dagent: dagentNetwork },
        }
      : name == ImageName.Redis
      ? {
          environment: [] as Environment[],
          config: { ports: [{ external: 6379, internal: 6379 }], dagent: dagentNetwork },
        }
      : { environment: [] as Environment[], config: {} }

  // seed ids
  config.environment.map(x => (x.id = uuidv4()))
  return config
}
