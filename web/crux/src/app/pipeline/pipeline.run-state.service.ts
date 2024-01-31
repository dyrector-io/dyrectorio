import { Injectable, Logger } from '@nestjs/common'
import { Observable, Subject, finalize } from 'rxjs'
import { nameOfIdentity } from 'src/domain/identity'
import { PipelineRunStatusEvent } from 'src/domain/pipeline'
import TeamRepository from '../team/team.repository'
import { PipelineStatusMessage } from './pipeline.message'
import PipelineMetrics from './pipeline.metrics'
import PipelineService from './pipeline.service'

@Injectable()
export default class PipelineRunStateService {
  private readonly logger = new Logger(PipelineRunStateService.name)

  private readonly eventChannelByTeamId: Map<string, Subject<PipelineStatusMessage>> = new Map()

  constructor(
    private readonly teamRepository: TeamRepository,
    service: PipelineService,
  ) {
    service.runStatusEvent.subscribe(it => this.onPipelineRunStatusEvent(it))
  }

  async onUserJoined(teamSlug: string): Promise<Observable<PipelineStatusMessage>> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    let channel = this.eventChannelByTeamId.get(teamId)
    if (!channel) {
      channel = new Subject()
      this.eventChannelByTeamId.set(teamId, channel)

      PipelineMetrics.runStateChannelsCount().inc()
    }

    this.logger.verbose(`User joined to team: ${teamId}`)

    return channel.asObservable().pipe(finalize(() => this.cleanUp(teamId, channel)))
  }

  async onUserLeft(teamSlug: string): Promise<void> {
    const teamId = await this.teamRepository.getTeamIdBySlug(teamSlug)

    const channel = this.eventChannelByTeamId.get(teamId)
    if (!channel) {
      return
    }

    this.logger.verbose(`User left from team: ${teamId}`)
  }

  private cleanUp(teamId: string, channel: Subject<PipelineStatusMessage>) {
    if (channel.observed) {
      return
    }

    channel.complete()
    this.eventChannelByTeamId.delete(teamId)
    PipelineMetrics.runStateChannelsCount().dec()

    this.logger.verbose(`No more users, team deleted: ${teamId}`)
  }

  private onPipelineRunStatusEvent(event: PipelineRunStatusEvent) {
    this.logger.verbose(`Pipeline status event: ${event.runId} - ${event.status}`)

    const channel = this.eventChannelByTeamId.get(event.teamId)
    if (!channel) {
      return
    }

    channel.next({
      pipelineId: event.pipelineId,
      runId: event.runId,
      status: event.status,
      startedBy: !event.startedBy
        ? null
        : {
            id: event.startedBy.id,
            name: nameOfIdentity(event.startedBy),
          },
      finishedAt: event.finishedAt?.toUTCString(),
    })
  }
}
