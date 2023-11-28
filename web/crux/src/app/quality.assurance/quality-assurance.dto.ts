import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator'

export class QualityAssuranceGroupDto {
  @IsString()
  id: string

  @IsString()
  @IsOptional()
  name: string
}

export class QualityAssuranceDto {
  @IsBoolean()
  disabled: boolean

  @ValidateNested()
  @IsOptional()
  group?: QualityAssuranceGroupDto
}
