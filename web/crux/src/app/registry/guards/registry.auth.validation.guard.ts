import { HttpService } from '@nestjs/axios'
import { CanActivate, ExecutionContext, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import { JWT } from 'google-auth-library'
import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'
import { catchError, from, map, mergeMap, Observable, of, switchMap } from 'rxjs'
import { InvalidArgumentException, NotFoundException, UnauthenticatedException } from 'src/exception/errors'
import {
  CreateRegistryRequest,
  GithubRegistryDetails,
  GitlabRegistryDetails,
  GoogleRegistryDetails,
  HubRegistryDetails,
  V2RegistryDetails,
} from 'src/grpc/protobuf/proto/crux'
import { REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from 'src/shared/const'
import { parsers } from 'www-authenticate'

@Injectable()
export class RegistryAccessValidationGuard implements CanActivate {
  constructor(private httpService: HttpService) {}

  private readonly logger = new Logger(RegistryAccessValidationGuard.name)

  /**
   * Guard that checks the URL is a valid registry URL
   *
   * @param context
   * @returns boolean
   */
  canActivate(context: ExecutionContext): Observable<boolean> {
    const req = context.getArgByIndex<CreateRegistryRequest>(0)

    if (req.hub) {
      return this.validateHub(req.hub)
    } else if (req.v2) {
      return this.validateV2(req.v2)
    } else if (req.gitlab) {
      return this.validateGitlab(req.gitlab)
    } else if (req.github) {
      return this.validateGithub(req.github)
    } else if (req.google) {
      return this.validateGoogle(req.google)
    } else {
      return of(false)
    }
  }

  private validateHub(req: HubRegistryDetails): Observable<boolean> {
    if (!req.imageNamePrefix || req.imageNamePrefix.trim().length < 1) {
      return of(false)
    }

    return this.httpService.get(`https://${REGISTRY_HUB_URL}/v2/orgs/${req.imageNamePrefix}`).pipe(
      map(res => res.status === HttpStatus.OK),
      catchError((error: AxiosError) => {
        this.logger.warn(error)

        if (!error.response || error.response.status !== HttpStatus.NOT_FOUND) {
          throw new InvalidArgumentException({
            message: 'Failed to fetch hub prefix',
            property: 'imageNamePrefix',
            value: req.imageNamePrefix,
          })
        }

        throw new NotFoundException({
          message: 'Hub organization with prefix not found',
          property: 'imageNamePrefix',
          value: req.imageNamePrefix,
        })
      }),
    )
  }

  private validateV2(req: V2RegistryDetails): Observable<boolean> {
    const withCredentials = !!req.user
    const auth = {
      username: req.user,
      password: req.token,
    }

    return this.httpService
      .get(`https://${req.url}/v2/`, {
        withCredentials,
        auth,
      })
      .pipe(
        map(res => res.status === HttpStatus.OK),
        catchError((error: AxiosError) => {
          this.logger.warn(error)

          if (!withCredentials || !error.response || error.response.status !== HttpStatus.UNAUTHORIZED) {
            throw new InvalidArgumentException({
              message: 'Failed to fetch v2 registry',
              property: 'url',
              value: req.url,
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
                  message: 'Failed to authenticate with the v2 registry',
                })
              }),
            )
        }),
      )
  }

  private validateGitlab(req: GitlabRegistryDetails) {
    const auth = {
      username: req.user,
      password: req.token,
    }

    const { apiUrl, registryUrl } = REGISTRY_GITLAB_URLS

    return this.httpService
      .get(`https://${apiUrl}/api/v4/groups?top_level_only=true&search=${req.imageNamePrefix}`, {
        headers: {
          Authorization: `Bearer ${auth.password}`,
        },
      })
      .pipe(
        mergeMap(res => {
          const groups = res.data as any[]
          if (res.status !== HttpStatus.OK || groups.length < 1) {
            return of(false)
          }

          return this.httpService
            .get(`https://${apiUrl}/jwt/auth?service=container_registry&scope=repository:${req.imageNamePrefix}:pull`, {
              withCredentials: true,
              auth,
            })
            .pipe(
              mergeMap(res => {
                const token = res.data as GitlabToken

                return this.httpService
                  .get(`https://${registryUrl}/v2/`, {
                    headers: {
                      Authorization: `Bearer ${token.token}`,
                    },
                  })
                  .pipe(map(res => res.status === HttpStatus.OK))
              }),
            )
        }),
        catchError((error: AxiosError) => {
          this.logger.warn(error)

          const res = error.response
          if (res) {
            if (res.status === HttpStatus.NOT_FOUND) {
              throw new NotFoundException({
                message: 'Gitlab group with prefix not found',
                property: 'imageNamePrefix',
                value: req.imageNamePrefix,
              })
            } else if (res.status === HttpStatus.FORBIDDEN || res.status === HttpStatus.UNAUTHORIZED) {
              throw new UnauthenticatedException({
                message: 'Failed to authenticate with the gitlab registry',
              })
            }
          }

          throw new InvalidArgumentException({
            message: 'Failed to fetch gitlab prefix',
            property: 'imageNamePrefix',
            value: req.imageNamePrefix,
          })
        }),
      )
  }

  private validateGithub(req: GithubRegistryDetails) {
    const auth = {
      username: req.user,
      password: req.token,
    }

    return this.httpService
      .get(`https://api.github.com/orgs/${req.imageNamePrefix}/packages?package_type=container`, {
        withCredentials: true,
        auth,
      })
      .pipe(
        map(res => res.status === HttpStatus.OK),
        catchError((error: AxiosError) => {
          this.logger.warn(error)

          const res = error.response
          if (res) {
            if (res.status === HttpStatus.NOT_FOUND) {
              throw new NotFoundException({
                message: 'Github organization with prefix not found',
                property: 'imageNamePrefix',
                value: req.imageNamePrefix,
              })
            } else if (res.status === HttpStatus.FORBIDDEN || res.status === HttpStatus.UNAUTHORIZED) {
              throw new UnauthenticatedException({
                message: 'Failed to authenticate with the github registry',
              })
            }
          }

          throw new InvalidArgumentException({
            message: 'Failed to fetch github prefix',
            property: 'imageNamePrefix',
            value: req.imageNamePrefix,
          })
        }),
      )
  }

  private validateGoogle(req: GoogleRegistryDetails): Observable<boolean> {
    const withCredentials = !!req.user
    const client = withCredentials
      ? new JWT({
          email: req.user,
          key: req.token,
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        })
      : null

    const validator = (accessTokenResponse: GetAccessTokenResponse) =>
      this.httpService
        .get(`https://gcr.io/v2/${req.url}/tags/list`, {
          withCredentials,
          auth: {
            username: 'oauth2accesstoken',
            password: accessTokenResponse?.token,
          },
        })
        .pipe(
          map(res => res.status === HttpStatus.OK),
          catchError((error: AxiosError) => {
            this.logger.warn(error)

            if (!withCredentials || !error.response || error.response.status !== HttpStatus.UNAUTHORIZED) {
              throw new InvalidArgumentException({
                message: 'Failed to fetch google registry',
                property: 'url',
                value: req.url,
              })
            }

            const authenticate = new parsers.WWW_Authenticate(error.response.headers['www-authenticate'])
            const registryServiceTokenUrl = `${authenticate.parms.realm}?service=${authenticate.parms.service}`

            return this.httpService
              .get(registryServiceTokenUrl.toString(), {
                withCredentials,
                auth: {
                  username: 'oauth2accesstoken',
                  password: accessTokenResponse?.token,
                },
              })
              .pipe(
                map(res => res.status === HttpStatus.OK),
                catchError(() => {
                  throw new UnauthenticatedException({
                    message: 'Failed to authenticate with the google registry',
                  })
                }),
              )
          }),
        )

    return withCredentials
      ? from(client.getAccessToken()).pipe(
          catchError(error => {
            error.error
            throw new UnauthenticatedException({
              message: 'Failed to authenticate with the google registry',
            })
          }),
          switchMap(token => validator(token)),
        )
      : validator(null)
  }
}

type GitlabToken = {
  token: string
}
