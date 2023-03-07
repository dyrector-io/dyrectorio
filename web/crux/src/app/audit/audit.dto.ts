import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

// TODO(@polaroi8d) Remove the Dto after removing gRPC
export class AuditLogListRequestDto {
  @IsNotEmpty()
  @IsNumber()
  pageSize: number

  @IsNotEmpty()
  @IsNumber()
  pageNumber: number

  @IsOptional()
  @IsString()
  keyword?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdFrom?: Date

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  createdTo: Date
}

// TODO(@polaroi8d) Remove the Dto after removing gRPC
export class AuditLogListResponseDto {
  @ArrayNotEmpty()
  data: AuditLogResponseDto[]
}

// TODO(@polaroi8d) Remove the Dto after removing gRPC
export class AuditLogResponseDto {
  @Type(() => Date)
  @IsDate()
  createdAt: Date

  @IsString()
  userId: string

  @IsString()
  identityEmail: string

  @IsString()
  serviceCall: string

  @IsOptional()
  data?: Object
}

// TODO(@polaroi8d) Remove the Dto after removing gRPC
export class AuditLogListCountResponseDto {
  @IsNumber()
  count: number
}
