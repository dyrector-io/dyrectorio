import { IsBoolean, IsInt, IsOptional, IsUUID, ValidateNested } from 'class-validator'

export class OnboardingItemDto {
  @IsBoolean()
  done: boolean

  @IsUUID()
  @IsOptional()
  resourceId?: string
}

export class OnboardingDto {
  @ValidateNested()
  signUp: OnboardingItemDto

  @ValidateNested()
  createTeam: OnboardingItemDto

  @ValidateNested()
  createNode: OnboardingItemDto

  @ValidateNested()
  createProject: OnboardingItemDto

  @ValidateNested()
  createVersion: OnboardingItemDto

  @ValidateNested()
  addImages: OnboardingItemDto

  @ValidateNested()
  addDeployment: OnboardingItemDto

  @ValidateNested()
  deploy: OnboardingItemDto
}

export class DashboardDto {
  @IsInt()
  users: number

  @IsInt()
  auditLog: number

  @IsInt()
  projects: number

  @IsInt()
  versions: number

  @IsInt()
  deployments: number

  @IsInt()
  failedDeployments: number

  @ValidateNested()
  onboarding: OnboardingDto
}
