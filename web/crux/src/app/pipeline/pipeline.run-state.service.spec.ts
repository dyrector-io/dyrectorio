import TeamRepository from '../team/team.repository'
import PipelineRunStateService from './pipeline.run-state.service'
import PipelineService from './pipeline.service'

const TEAM_SLUG = 'team-slug'
const TEAM_ID = 'team-id'

const teamRepositoryMock = new (<new () => TeamRepository>TeamRepository)() as jest.Mocked<TeamRepository>
teamRepositoryMock.getTeamIdBySlug = jest.fn().mockResolvedValue(TEAM_ID)

const pipelineServiceMock = jest.mocked(PipelineService, {
  shallow: true,
})

describe('PipelineRunStateService', () => {
  let service: PipelineRunStateService = null

  beforeEach(() => {
    pipelineServiceMock.mockReset()

    service = new PipelineRunStateService(teamRepositoryMock as any, pipelineServiceMock as any)
  })

  it('should send status updates to subscribed users', async () => {
    const messageReceived = jest.fn()

    const messages = await service.onUserJoined(TEAM_SLUG)
    messages.subscribe(messageReceived)

    pipelineServiceMock.mockImplementation(() => {
      
    })

    const agentObs = agentService.handleConnect(new GrpcNodeConnectionMock(), info)
    const agentSub = agentObs.subscribe(() => {})

    await eventPromise
    expect(agentSub.closed).toBe(false)

    expect(createNodeEventMock).toHaveBeenCalled()
  })
})
