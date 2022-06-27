import { HttpService } from '@nestjs/axios'
import { CanActivate, ExecutionContext, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { catchError, map, Observable, of } from 'rxjs'
import { InvalidArgumentException, UnauthenticatedException } from 'src/exception/errors'
import { CreateRegistryRequest, RegistryType } from 'src/proto/proto/crux'
import { parsers } from 'www-authenticate'

@Injectable()
export class RegistryAuthValidationGuard implements CanActivate {
  constructor(private httpService: HttpService) {}

  private readonly logger = new Logger(RegistryAuthValidationGuard.name)

  /**
   * Guard that checks the URL is a valid registry URL
   *
   * @param context
   * @returns boolean
   */
  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.getArgByIndex<CreateRegistryRequest>(0)

    const withCredentials = !!request.user
    const auth = {
      username: request.user,
      password: request.token,
    }

    // Skip the v2 URL check part if the registry type is DockerHUB
    if (request.type === RegistryType.HUB) {
      return of(true)
    }

    return this.httpService
      .get(`https://${request.url}/v2/`, {
        withCredentials,
        auth,
      })
      .pipe(
        map(res => res.status === HttpStatus.OK),
        catchError(error => {
          this.logger.warn(error)

          if (!withCredentials || !error.response || error.response.status !== HttpStatus.UNAUTHORIZED) {
            throw new InvalidArgumentException({
              message: 'Failed to fetch registry',
              property: 'url',
              value: request.url,
            })
          }

          const authenticate = new parsers.WWW_Authenticate(error.response.headers['www-authenticate'])
          const registryServiceTokenUrl = `${authenticate.parms.realm}?service=${authenticate.parms.service}`

          return this.httpService
            .get(registryServiceTokenUrl.toString(), {
              withCredentials,
              auth,
            })
            .pipe(
              map(res => res.status === HttpStatus.OK),
              catchError(() => {
                throw new UnauthenticatedException({
                  message: 'Failed to authenticate with the registry',
                })
              }),
            )
        }),
      )
  }
}
