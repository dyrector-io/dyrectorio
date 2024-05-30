import { OmitType } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { NodeDto } from '../node/node.dto'
import { BasicProjectDto } from '../project/project.dto'
import { VersionChainDto } from '../version/version.dto'

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

export class PackageDto {
  @IsUUID()
  id: string

  @IsString()
  name: string

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

export class UpdatePackageEnvironmentDto {
  @IsString()
  name: string

  @IsUUID()
  nodeId: string

  @IsString()
  prefix: string
}

export class CreatePackageEnvironmentDto extends UpdatePackageEnvironmentDto {}
