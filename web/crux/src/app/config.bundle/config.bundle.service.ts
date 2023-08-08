import { Injectable, Logger } from '@nestjs/common'
import { Identity } from '@ory/kratos-client'
import { toPrismaJson } from 'src/domain/utils'
import PrismaService from 'src/services/prisma.service'
import { EditorLeftMessage, EditorMessage } from '../editor/editor.message'
import EditorServiceProvider from '../editor/editor.service.provider'
import TeamRepository from '../team/team.repository'
import {
  ConfigBundleDetailsDto,
  ConfigBundleDto,
  ConfigBundleOptionDto,
  CreateConfigBundleDto,
  PatchConfigBundleDto,
} from './config.bundle.dto'
import ConfigBundleMapper from './config.bundle.mapper'

@Injectable()
export default class ConfigBundleService {
  private readonly logger = new Logger(ConfigBundleService.name)

  constructor(
    private teamRepository: TeamRepository,
    private prisma: PrismaService,
    private mapper: ConfigBundleMapper,
    private readonly editorServices: EditorServiceProvider,
  ) {}

  async getConfigBundles(teamSlug: string): Promise<ConfigBundleDto[]> {
    const configBundles = await this.prisma.configBundle.findMany({
      where: {
        team: {
          slug: teamSlug,
        },
      },
    })

    return configBundles.map(it => this.mapper.listItemToDto(it))
  }

  async getConfigBundleDetails(id: string): Promise<ConfigBundleDetailsDto> {
    const configBundle = await this.prisma.configBundle.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return this.mapper.detailsToDto(configBundle)
  }

  async createConfigBundle(
    teamSlug: string,
    req: CreateConfigBundleDto,
    identity: Identity,
  ): Promise<ConfigBundleDetailsDto> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const configBundle = await this.prisma.configBundle.create({
      data: {
        name: req.name,
        data: [],
        teamId,
        createdBy: identity.id,
      },
    })

    return this.mapper.detailsToDto(configBundle)
  }

  async patchConfigBundle(id: string, req: PatchConfigBundleDto, identity: Identity): Promise<void> {
    await this.prisma.configBundle.update({
      where: {
        id,
      },
      data: {
        name: req.name ?? undefined,
        data: req.environment ? toPrismaJson(req.environment) : undefined,
        updatedBy: identity.id,
      },
    })
  }

  async deleteConfigBundle(id: string): Promise<void> {
    await this.prisma.configBundle.delete({
      where: {
        id,
      },
    })
  }

  async getConfigBundleOptions(teamSlug: string): Promise<ConfigBundleOptionDto[]> {
    const configBundles = await this.prisma.configBundle.findMany({
      where: {
        team: {
          slug: teamSlug,
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    return configBundles
  }

  async checkConfigBundleIsInTeam(teamSlug: string, configBundleId: string, identity: Identity): Promise<boolean> {
    const configBundles = await this.prisma.configBundle.count({
      where: {
        id: configBundleId,
        team: {
          slug: teamSlug,
          users: {
            some: {
              userId: identity.id,
            },
          },
        },
      },
    })

    return configBundles > 0
  }

  async onEditorJoined(
    deploymentId: string,
    clientToken: string,
    identity: Identity,
  ): Promise<[EditorMessage, EditorMessage[]]> {
    const editors = await this.editorServices.getOrCreateService(deploymentId)

    const me = editors.onClientJoin(clientToken, identity)

    return [me, editors.getEditors()]
  }

  async onEditorLeft(deploymentId: string, clientToken: string): Promise<EditorLeftMessage> {
    const editors = await this.editorServices.getOrCreateService(deploymentId)
    const message = editors.onClientLeft(clientToken)

    if (editors.editorCount < 1) {
      this.logger.verbose(`All editors left removing ${deploymentId}`)
      this.editorServices.free(deploymentId)
    }

    return message
  }
}
