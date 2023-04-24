import { SetMetadata } from '@nestjs/common'

const UuidParams = (...uuidParams: string[]) => SetMetadata('uuidParams', uuidParams)

export default UuidParams
