import { Injectable, PipeTransform } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CruxBadRequestException } from 'src/exception/crux-exception'
import { GET_CONTAINER_LOG_DEFAULT_TAKE } from 'src/shared/const'
import { NodeContainerLogQuery } from '../node.dto'

@Injectable()
export default class NodeContainerLogQueryValidationPipe implements PipeTransform {
  constructor(private readonly configService: ConfigService) {}

  async transform(query: NodeContainerLogQuery) {
    const maxTake = this.configService.get<number>('MAX_CONTAINER_LOG_TAKE', 1000)

    if (!query.take) {
      query.take = GET_CONTAINER_LOG_DEFAULT_TAKE
    }

    if (query.take > maxTake) {
      throw new CruxBadRequestException({
        message: 'Invalid take',
        property: 'take',
        value: query.take,
      })
    }

    return query
  }
}
