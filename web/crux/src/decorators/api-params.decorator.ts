import { SetMetadata } from '@nestjs/common'

const Params = (...params: string[]) => SetMetadata('params', params)

export default Params
