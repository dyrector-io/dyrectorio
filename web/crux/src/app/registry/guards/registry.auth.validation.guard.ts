import { HttpService } from '@nestjs/axios'
import { CanActivate, ExecutionContext, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { AxiosBasicCredentials, AxiosError } from 'axios'
import { JWT } from 'google-auth-library'
import { GetAccessTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'
import { Observable, catchError, concatAll, from, map, mergeMap, of, switchMap } from 'rxjs'
import { CruxBadRequestException, CruxNotFoundException, CruxUnauthorizedException } from 'src/exception/crux-exception'
import { REGISTRY_GITLAB_URLS, REGISTRY_HUB_URL } from 'src/shared/const'
import { parsers } from 'www-authenticate'
import PrivateHubApiClient from '../registry-clients/private-hub-api-client'
import {
  CreateGithubRegistryDetailsDto,
  CreateGitlabRegistryDetailsDto,
  CreateGoogleRegistryDetailsDto,
  CreateHubRegistryDetailsDto,
  CreateRegistryDto,
  CreateV2RegistryDetailsDto,
  UpdateGithubRegistryDetailsDto,
  UpdateGitlabRegistryDetailsDto,
  UpdateGoogleRegistryDetailsDto,
  UpdateHubRegistryDetailsDto,
  UpdateRegistryDto,
  UpdateV2RegistryDetailsDto,
} from '../registry.dto'
import RegistryService from '../registry.service'

@Injectable()
export default class RegistryAuthValidationGuard implements CanActivate {
  constructor(
    private httpService: HttpService,
    private service: RegistryService,
  ) {}

  private readonly logger = new Logger(RegistryAuthValidationGuard.name)

  /**
   * Guard that checks the URL is a valid registry URL
   *
   * @param context
   * @returns boolean
   */
  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const registryId = request.params.registryId as string
    const body = request.body as CreateRegistryDto | UpdateRegistryDto

    if (body.type === 'hub') {
      return from(
        this.validateHub(registryId, body.details as CreateHubRegistryDetailsDto | UpdateHubRegistryDetailsDto),
      ).pipe(concatAll())
    }
    if (body.type === 'v2') {
      return from(
        this.validateV2(registryId, body.details as CreateV2RegistryDetailsDto | UpdateV2RegistryDetailsDto),
      ).pipe(concatAll())
    }
    if (body.type === 'gitlab') {
      return from(
        this.validateGitlab(
          registryId,
          body.details as CreateGitlabRegistryDetailsDto | UpdateGitlabRegistryDetailsDto,
        ),
      ).pipe(concatAll())
    }
    if (body.type === 'github') {
      return from(
        this.validateGithub(
          registryId,
          body.details as CreateGithubRegistryDetailsDto | UpdateGithubRegistryDetailsDto,
        ),
      ).pipe(concatAll())
    }
    if (body.type === 'google') {
      return from(
        this.validateGoogle(
          registryId,
          body.details as CreateGoogleRegistryDetailsDto | UpdateGoogleRegistryDetailsDto,
        ),
      ).pipe(concatAll())
    }
    if (body.type === 'unchecked') {
      return of(true)
    }
    return of(false)
  }

  private async validateHub(
    registryId: string,
    req: CreateHubRegistryDetailsDto | UpdateHubRegistryDetailsDto,
  ): Promise<Observable<boolean>> {
    if (!req.imageNamePrefix || req.imageNamePrefix.trim().length < 1) {
      return of(false)
    }

    if (req.public) {
      return this.httpService.get(`https://${REGISTRY_HUB_URL}/v2/orgs/${req.imageNamePrefix}`).pipe(
        map(res => res.status === HttpStatus.OK),
        catchError((error: AxiosError) => {
          this.logger.warn(error)

          if (!error.response || error.response.status !== HttpStatus.NOT_FOUND) {
            throw new CruxBadRequestException({
              message: 'Failed to fetch hub prefix',
              property: 'imageNamePrefix',
              value: req.imageNamePrefix,
            })
          }

          throw new CruxNotFoundException({
            message: 'Hub organization with prefix not found',
            property: 'imageNamePrefix',
            value: req.imageNamePrefix,
          })
        }),
      )
    }

    const creds = await this.getCredentialsForRegistry(registryId, req)

    const hubClient = new PrivateHubApiClient(REGISTRY_HUB_URL, req.imageNamePrefix)
    return from(hubClient.login(creds.username, creds.password)).pipe(
      map(() => true),
      catchError(err => {
        throw err
      }),
    )
  }

  private async validateV2(
    registryId: string,
    req: CreateV2RegistryDetailsDto | UpdateV2RegistryDetailsDto,
  ): Promise<Observable<boolean>> {
    const withCredentials = !req.public
    const auth = await this.getCredentialsForRegistry(registryId, req)

    return this.httpService
      .get(`https://${req.url}/v2/${req.imageNamePrefix ?? ''}`, {
        withCredentials,
        auth,
      })
      .pipe(
        map(res => res.status === HttpStatus.OK),
        catchError((error: AxiosError) => {
          this.logger.warn(error)

          if (!withCredentials || !error.response || error.response.status !== HttpStatus.UNAUTHORIZED) {
            throw new CruxBadRequestException({
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
                throw new CruxUnauthorizedException({
                  message: 'Failed to authenticate with the v2 registry',
                })
              }),
            )
        }),
      )
  }

  private async validateGitlab(
    registryId: string,
    req: CreateGitlabRegistryDetailsDto | UpdateGitlabRegistryDetailsDto,
  ): Promise<Observable<boolean>> {
    const auth = await this.getCredentialsForRegistry(registryId, req)

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
              throw new CruxBadRequestException({
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
              throw new CruxNotFoundException({
                message: 'Gitlab namespace not found',
                property: 'imageNamePrefix',
                value: req.imageNamePrefix,
              })
            } else if (res.status === HttpStatus.FORBIDDEN || res.status === HttpStatus.UNAUTHORIZED) {
              throw new CruxUnauthorizedException({
                message: 'Failed to authenticate with the gitlab registry',
              })
            }
          }

          throw new CruxBadRequestException({
            message: 'Failed to fetch gitlab prefix',
            property: 'imageNamePrefix',
            value: req.imageNamePrefix,
          })
        }),
      )
  }

  private async validateGithub(
    registryId: string,
    req: CreateGithubRegistryDetailsDto | UpdateGithubRegistryDetailsDto,
  ): Promise<Observable<boolean>> {
    const auth = await this.getCredentialsForRegistry(registryId, req)

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
              throw new CruxNotFoundException({
                message: 'Github namespace not found',
                property: 'imageNamePrefix',
                value: req.imageNamePrefix,
              })
            } else if (res.status === HttpStatus.FORBIDDEN || res.status === HttpStatus.UNAUTHORIZED) {
              throw new CruxUnauthorizedException({
                message: 'Failed to authenticate with the github registry',
              })
            }
          }

          throw new CruxBadRequestException({
            message: 'Failed to fetch github prefix',
            property: 'imageNamePrefix',
            value: req.imageNamePrefix,
          })
        }),
      )
  }

  private async validateGoogle(
    registryId: string,
    req: CreateGoogleRegistryDetailsDto | UpdateGoogleRegistryDetailsDto,
  ): Promise<Observable<boolean>> {
    const creds = await this.getCredentialsForRegistry(registryId, req)

    const withCredentials = !req.public
    const client = withCredentials
      ? new JWT({
          email: creds.username,
          key: creds.password,
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
              throw new CruxBadRequestException({
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
                  throw new CruxUnauthorizedException({
                    message: 'Failed to authenticate with the google registry',
                  })
                }),
              )
          }),
        )

    return withCredentials
      ? from(client.getAccessToken()).pipe(
          catchError(() => {
            throw new CruxUnauthorizedException({
              message: 'Failed to authenticate with the google registry',
            })
          }),
          switchMap(token => validator(token)),
        )
      : validator(null)
  }

  private async getCredentialsForRegistry(
    registryId: string,
    req: RequestWithCredentials,
  ): Promise<AxiosBasicCredentials> {
    if (!registryId || req.user) {
      return {
        username: req.user,
        password: req.token,
      }
    }

    const info = await this.service.getRegistryConnectionInfoById(registryId)
    return {
      username: info.user,
      password: info.token,
    }
  }
}

type RequestWithCredentials = {
  user?: string
  token?: string
}

type GitlabToken = {
  token: string
}
