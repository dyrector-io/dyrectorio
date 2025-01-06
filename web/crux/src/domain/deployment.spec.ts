import { DeploymentStatusEnum, VersionTypeEnum } from '@prisma/client'
import { ContainerState, DeploymentStatus as ProtoDeploymentStatus } from 'src/grpc/protobuf/proto/common'
import {
  checkDeploymentCopiability,
  checkDeploymentDeployability,
  containerNameFromImageName,
  containerStateToDto,
  deploymentIsDeletable,
  deploymentIsMutable,
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
    expect(containerStateToDto(ContainerState.RUNNING)).toEqual('running')
    expect(containerStateToDto(ContainerState.WAITING)).toEqual('waiting')
    expect(containerStateToDto(ContainerState.EXITED)).toEqual('exited')

    expect(containerStateToDto(ContainerState.UNRECOGNIZED)).toEqual(null)
    expect(containerStateToDto(null)).toEqual(null)
    expect(containerStateToDto(undefined)).toEqual(null)
  })

  it('test containerNameFromImageName', () => {
    expect(containerNameFromImageName('container')).toEqual('container')
    expect(containerNameFromImageName('/container')).toEqual('container')
    expect(containerNameFromImageName('/other/container')).toEqual('container')

    expect(containerNameFromImageName('container:tag')).toEqual('container:tag')
    expect(containerNameFromImageName('/container:tag')).toEqual('container:tag')
    expect(containerNameFromImageName('/other/container:tag')).toEqual('container:tag')
  })

  describe('checkDeploymentCopiability', () => {
    it.each(DEPLOYMENT_STATUSES_VERSION_TYPES)(
      'should be true when status is not inProgress or preparing and the version is not rolling (%p and %p)',
      (status: DeploymentStatusEnum) => {
        expect(checkDeploymentCopiability(status)).toEqual(status !== 'inProgress')
      },
    )

    it.each(DEPLOYMENT_STATUSES)('%p and %p', (status: DeploymentStatusEnum) => {
      expect(deploymentIsDeletable(status)).toEqual(status !== 'inProgress')
    })
  })

  describe('checkDeploymentMutability', () => {
    it.each(DEPLOYMENT_STATUSES_VERSION_TYPES)(
      'should return true if status is deploying or if the status is successful or failed and the version is rolling (%p and %p)',
      (status: DeploymentStatusEnum, type: VersionTypeEnum) => {
        expect(deploymentIsMutable(status, type)).toEqual(
          status === 'preparing' || status === 'failed' || (status === 'successful' && type === 'rolling'),
        )
      },
    )

    it.each(DEPLOYMENT_STATUSES_VERSION_TYPES)(
      'should return true if status is preparing, is obsolete or is successful or failed and the type is rolling (%p and %p)',
      (status: DeploymentStatusEnum, type: VersionTypeEnum) => {
        expect(checkDeploymentDeployability(status, type)).toEqual(
          status === 'preparing' ||
            status === 'obsolete' ||
            status === 'failed' ||
            (status === 'successful' && type === 'rolling'),
        )
      },
    )
  })
})
