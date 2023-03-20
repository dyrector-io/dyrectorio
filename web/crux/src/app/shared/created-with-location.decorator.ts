import { SetMetadata } from '@nestjs/common'

export const CREATED_WITH_LOCATION = 'created-with-location'

export const CreatedWithLocation = () => SetMetadata(CREATED_WITH_LOCATION, true)

export type CreatedResponse<T> = {
  url: string
  body: T
}
