import { HttpService } from '@nestjs/axios'
import { CanActivate, ExecutionContext, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { AxiosError } from 'axios'
import { JWT } from 'google-auth-library'
import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'
import { catchError, from, map, mergeMap, Observable, of, switchMap } from 'rxjs'
import { InvalidArgumentException, NotFoundException, UnauthenticatedException } from 'src/exception/errors'
import { REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from 'src/shared/const'
import { parsers } from 'www-authenticate'
import {
  CreateRegistry,
  GithubRegistryDetails,
  GitlabRegistryDetails,
  GoogleRegistryDetails,
  HubRegistryDetails,
  UpdateRegistry,
  V2RegistryDetails,
} from '../registry.dto'

@Injectable()
export default class RegistryAccessValidationGuard implements CanActivate {
  constructor(private httpService: HttpService) {}

  private readonly logger = new Logger(RegistryAccessValidationGuard.name)

  /**
   * Guard that checks the URL is a valid registry URL
   *
   * @param context
   * @returns boolean
   */
  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const body = request.body as CreateRegistry | UpdateRegistry

    if (body.type === 'hub') {
      return this.validateHub(body.details as HubRegistryDetails)
    }
    if (body.type === 'v2') {
      return this.validateV2(body.details as V2RegistryDetails)
    }
    if (body.type === 'gitlab') {
      return this.validateGitlab(body.details as GitlabRegistryDetails)
    }
    if (body.type === 'github') {
      return this.validateGithub(body.details as GithubRegistryDetails)
    }
    if (body.type === 'google') {
      return this.validateGoogle(body.details as GoogleRegistryDetails)
    }
    if (body.type === 'unchecked') {
      return of(true)
    }
    return of(false)
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

    const apiUrl = req.apiUrl ?? REGISTRY_GITLAB_URLS.apiUrl
    const registryUrl = req.url ?? REGISTRY_GITLAB_URLS.registryUrl

    const namespace = req.namespace === 'group' ? 'groups' : 'projects'

    return this.httpService
      .get(`https://${apiUrl}/api/v4/${namespace}/${req.imageNamePrefix}`, {
        headers: {
          Authorization: `Bearer ${auth.password}`,
        },
      })
      .pipe(
        mergeMap(response => {
          if (response.status !== HttpStatus.OK) {
            if (response.status === HttpStatus.NOT_FOUND) {
              throw new InvalidArgumentException({
                message: 'Gitlab namespace not found',
                property: 'imageNamePrefix',
                value: req.imageNamePrefix,
              })
            } else {
              return of(false)
            }
          }

          return this.httpService
            .get(`https://${apiUrl}/jwt/auth?service=container_registry&scope=repository:${req.imageNamePrefix}:pull`, {
              withCredentials: true,
              auth,
            })
            .pipe(
              mergeMap(registryRes => {
                const token = registryRes.data as GitlabToken

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
                message: 'Gitlab namespace not found',
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

    const namespace = req.namespace === 'organization' ? 'orgs' : 'users'

    return this.httpService
      .get(`https://api.github.com/${namespace}/${req.imageNamePrefix}/packages?package_type=container`, {
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
                message: 'Github namespace not found',
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
        .get(`https://${req.url}/v2/${req.imageNamePrefix}/tags/list`, {
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
                property: 'imageNamePrefix',
                value: req.imageNamePrefix,
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
          catchError(() => {
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
