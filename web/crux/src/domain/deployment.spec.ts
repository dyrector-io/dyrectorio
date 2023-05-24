import { DeploymentStatusEnum, VersionTypeEnum } from '@prisma/client'
import { ContainerState, DeploymentStatus as ProtoDeploymentStatus } from 'src/grpc/protobuf/proto/common'
import {
  checkDeploymentCopiability,
  checkDeploymentDeletability,
  checkDeploymentDeployability,
  checkDeploymentMutability,
  containerNameFromImageName,
  containerStateToDb,
  deploymentStatusToDb,
} from './deployment'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEPLOYMENT_STATUSES = Object.entries(DeploymentStatusEnum).map(([key, value]) => value)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VERSION_TYPES = Object.entries(VersionTypeEnum).map(([key, value]) => value)

const DEPLOYMENT_STATUSES_VERSION_TYPES = DEPLOYMENT_STATUSES.flatMap(status =>
  VERSION_TYPES.map(type => [status, type]),
)

describe('DomainDeployment', () => {
  it('test deploymentStatusToDb', () => {
    expect(deploymentStatusToDb(ProtoDeploymentStatus.PREPARING)).toEqual('preparing')
    expect(deploymentStatusToDb(ProtoDeploymentStatus.IN_PROGRESS)).toEqual('inProgress')
    expect(deploymentStatusToDb(ProtoDeploymentStatus.SUCCESSFUL)).toEqual('successful')
    expect(deploymentStatusToDb(ProtoDeploymentStatus.FAILED)).toEqual('failed')
    expect(deploymentStatusToDb(ProtoDeploymentStatus.OBSOLETE)).toEqual('obsolete')
    expect(deploymentStatusToDb(ProtoDeploymentStatus.DOWNGRADED)).toEqual('downgraded')
    expect(deploymentStatusToDb(ProtoDeploymentStatus.DEPLOYMENT_STATUS_UNSPECIFIED)).toEqual(
      'deployment_status_unspecified',
    )
    expect(deploymentStatusToDb(ProtoDeploymentStatus.UNRECOGNIZED)).toEqual('unrecognized')
  })

  it('test containerStateToDb', () => {
    expect(containerStateToDb(ContainerState.RUNNING)).toEqual('running')
    expect(containerStateToDb(ContainerState.WAITING)).toEqual('waiting')
    expect(containerStateToDb(ContainerState.EXITED)).toEqual('exited')

    expect(containerStateToDb(ContainerState.UNRECOGNIZED)).toEqual(null)
    expect(containerStateToDb(null)).toEqual(null)
    expect(containerStateToDb(undefined)).toEqual(null)
  })

  it('test containerNameFromImageName', () => {
    expect(containerNameFromImageName('container')).toEqual('container')
    expect(containerNameFromImageName('/container')).toEqual('container')
    expect(containerNameFromImageName('/other/container')).toEqual('container')

    expect(containerNameFromImageName('container:tag')).toEqual('container:tag')
    expect(containerNameFromImageName('/container:tag')).toEqual('container:tag')
    expect(containerNameFromImageName('/other/container:tag')).toEqual('container:tag')
  })

  it.each(DEPLOYMENT_STATUSES_VERSION_TYPES)(
    'checkDeploymentCopiability should be true when status is not inProgress or preparing and the version is not rolling (%p and %p)',
    (status: DeploymentStatusEnum, type: VersionTypeEnum) => {
      expect(checkDeploymentCopiability(status, type)).toEqual(
        type !== 'rolling' && status !== 'inProgress' && status !== 'preparing',
      )
    },
  )

  it.each(DEPLOYMENT_STATUSES)('test checkDeploymentCopiability for %p and %p', (status: DeploymentStatusEnum) => {
    expect(checkDeploymentDeletability(status)).toEqual(status !== 'inProgress')
  })

  it.each(DEPLOYMENT_STATUSES_VERSION_TYPES)(
    'checkDeploymentMutability should return true if status is deploying or if the status is successful or failed and the version is rolling (%p and %p)',
    (status: DeploymentStatusEnum, type: VersionTypeEnum) => {
      expect(checkDeploymentMutability(status, type)).toEqual(
        status === 'preparing' || ((status === 'successful' || status === 'failed') && type === 'rolling'),
      )
    },
  )

  it.each(DEPLOYMENT_STATUSES_VERSION_TYPES)(
    'checkDeploymentMutability should return true if status is preparing, is obsolete or is successful or failed and the type is rolling (%p and %p)',
    (status: DeploymentStatusEnum, type: VersionTypeEnum) => {
      expect(checkDeploymentDeployability(status, type)).toEqual(
        status === 'preparing' ||
          status === 'obsolete' ||
          ((status === 'successful' || status === 'failed') && type === 'rolling'),
      )
    },
  )
})
