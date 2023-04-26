import { SetMetadata } from '@nestjs/common'

export const UUID_PARAMS = 'uuidParams'

const UuidParams = (...uuidParams: string[]) => SetMetadata(UUID_PARAMS, [...uuidParams])

export default UuidParams
