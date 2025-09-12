import { DeploymentStatusEnum } from '@prisma/client'
import { ContainerState, DeploymentStatus as ProtoDeploymentStatus } from 'src/grpc/protobuf/proto/common'
import {
  checkDeploymentCopiability,
  containerNameFromImageName,
  containerStateToDto,
  deploymentIsDeletable,
  deploymentIsDeployable,
  deploymentIsMutable,
  deploymentStatusToDb,
} from './deployment'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEPLOYMENT_STATUSES = Object.entries(DeploymentStatusEnum).map(([_, value]) => value)

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
    it.each(DEPLOYMENT_STATUSES)(
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
    it.each(DEPLOYMENT_STATUSES)(
      'should return true if status is preparing, successful or failed (%p)',
      (status: DeploymentStatusEnum) => {
        expect(deploymentIsMutable(status)).toEqual(
          status === 'preparing' || status === 'failed' || status === 'successful',
        )
      },
    )

    it.each(DEPLOYMENT_STATUSES)(
      'should return true if status is preparing, obsolete, successful or failed (%p)',
      (status: DeploymentStatusEnum) => {
        expect(deploymentIsDeployable(status)).toEqual(
          status === 'preparing' ||
            status === 'obsolete' ||
            status === 'downgraded' ||
            status === 'failed' ||
            status === 'successful',
        )
      },
    )
  })
})
