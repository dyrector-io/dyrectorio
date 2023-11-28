import { ConfigService } from '@nestjs/config'
import { PRODUCTION } from './const'

// eslint-disable-next-line import/prefer-default-export
export const productionEnvironment = (config: ConfigService): boolean => config.get<string>('NODE_ENV') === PRODUCTION
