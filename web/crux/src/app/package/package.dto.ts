import { OmitType, PickType } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { BasicDeploymentDto } from '../deploy/deploy.dto'
import { NodeDto } from '../node/node.dto'
import { BasicProjectDto } from '../project/project.dto'
import { BasicVersionDto, VersionChainDto } from '../version/version.dto'

export class PackageEnvironmentDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

  @ValidateNested()
  node: NodeDto

  @IsString()
  prefix: string
}

export class PackageVersionChainDto extends VersionChainDto {
  @ValidateNested()
  project: BasicProjectDto
}

export class BasicPackageDto {
  @IsUUID()
  id: string

  @IsString()
  name: string
}

export class PackageDto extends BasicPackageDto {
  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @ValidateNested({ each: true })
  versionChains: PackageVersionChainDto[]

  @IsString({ each: true })
  environments: string[]
}

export class PackageDetailsDto extends OmitType(PackageDto, ['environments']) {
  @ValidateNested({ each: true })
  environments: PackageEnvironmentDto[]
}

export class UpdatePackageDto {
  @IsString()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsUUID(undefined, { each: true })
  chainIds: string[]
}

export class CreatePackageDto extends UpdatePackageDto {}

export class PackageVersionDto extends PickType(BasicVersionDto, ['id', 'name']) {
  @IsOptional()
  @ValidateNested()
  deployment?: BasicDeploymentDto
}

export class PackageEnvironmentVersionChainDto {
  @IsUUID()
  chainId: string

  @ValidateNested()
  project: BasicProjectDto

  @ValidateNested({ each: true })
  versions: PackageVersionDto[]
}

export class PackageEnvironmentDetailsDto extends PackageEnvironmentDto {
  @ValidateNested()
  package: BasicPackageDto

  @ValidateNested({ each: true })
  versionChains: PackageEnvironmentVersionChainDto[]
}

export class UpdatePackageEnvironmentDto {
  @IsString()
  name: string

  @IsUUID()
  nodeId: string

  @IsString()
  prefix: string
}

export class CreatePackageEnvironmentDto extends UpdatePackageEnvironmentDto {}

export class CreatePackageDeploymentDto {
  @IsUUID()
  versionId: string
}
