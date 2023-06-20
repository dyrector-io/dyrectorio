import { DynamicModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

export const CruxJwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { issuer: configService.get('CRUX_AGENT_ADDRESS') },
    verifyOptions: {
      issuer: configService.get('CRUX_AGENT_ADDRESS'),
    },
  }),
})

export const CruxPassportModule = PassportModule.register({ session: true })

export const CruxJwtModuleImports: DynamicModule[] = [CruxPassportModule, CruxJwtModule]
