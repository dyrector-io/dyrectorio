import { OnboardingItemDto } from './dashboard.dto'
import DashboardMapper, { DashboardTeam } from './dashboard.mapper'

describe('DashboardMapper', () => {
  let mapper: DashboardMapper = null
  let team: DashboardTeam = null

  const TEAM_ID = 'teamId'

  const NOT_DONE: OnboardingItemDto = {
    done: false,
  }

  beforeAll(() => {
    mapper = new DashboardMapper()
  })

  beforeEach(() => {
    team = {
      id: TEAM_ID,
      nodes: [],
      project: null,
      version: null,
      image: {
        config: null,
      },
      deployment: null,
    }
  })

  describe('teamToOnboard', () => {
    describe('signUp', () => {
      test('should be done', () => {
        const expected: OnboardingItemDto = { done: true }

        const actual = mapper.teamToOnboard(team)

        expect(actual.signUp).toEqual(expected)
      })
    })

    describe('createTeam', () => {
      test('should be done and contain the team id', () => {
        const expected: OnboardingItemDto = { done: true, resourceId: TEAM_ID }

        const actual = mapper.teamToOnboard(team)

        expect(actual.createTeam).toEqual(expected)
      })
    })

    describe('createNode', () => {
      test('should be false without a node', () => {
        const actual = mapper.teamToOnboard(team)

        expect(actual.createNode).toEqual(NOT_DONE)
      })

      test('should be done and contain the first node id, when there are nodes ', () => {
        const NODE_ID = 'nodeId'

        const expected: OnboardingItemDto = { done: true, resourceId: NODE_ID }

        team.nodes = [
          {
            id: NODE_ID,
          },
          {
            id: 'node-2',
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.createNode).toEqual(expected)
      })
    })

    describe('createProject', () => {
      test('should be false without a project', () => {
        const actual = mapper.teamToOnboard(team)

        expect(actual.createProject).toEqual(NOT_DONE)
      })

      test('should be done when there is a project', () => {
        const PROJECT_ID = 'projectId'

        const expected: OnboardingItemDto = { done: true, resourceId: PROJECT_ID }

        team.project = {
          id: PROJECT_ID,
        }

        const actual = mapper.teamToOnboard(team)

        expect(actual.createProject).toEqual(expected)
      })
    })

    describe('createVersion', () => {
      test('should be false with a project without a version', () => {
        team.project = {
          id: 'projectId',
        }

        const actual = mapper.teamToOnboard(team)

        expect(actual.createVersion).toEqual(NOT_DONE)
      })

      test('should be done when there is a version', () => {
        const VERSION_ID = 'versionId'

        const expected: OnboardingItemDto = { done: true, resourceId: VERSION_ID }

        team.project = {
          id: 'projectId',
        }
        team.version = {
          id: VERSION_ID,
        }

        const actual = mapper.teamToOnboard(team)

        expect(actual.createVersion).toEqual(expected)
      })
    })

    describe('addImages', () => {
      test('should be false with a project with a version without images', () => {
        team.project = {
          id: 'projectId',
        }
        team.version = {
          id: 'versionid',
        }

        const actual = mapper.teamToOnboard(team)

        expect(actual.addImages).toEqual(NOT_DONE)
      })

      test('should be done when there is an image', () => {
        const IMAGE_CONFIG_ID = 'imageConfigId'

        const expected: OnboardingItemDto = { done: true, resourceId: IMAGE_CONFIG_ID }

        team.project = {
          id: 'projectId',
        }
        team.version = {
          id: 'versionid',
        }
        team.image = {
          config: {
            id: IMAGE_CONFIG_ID,
          },
        }

        const actual = mapper.teamToOnboard(team)

        expect(actual.addImages).toEqual(expected)
      })
    })

    describe('addDeployment', () => {
      test('should be false with a project with a version without deployments', () => {
        team.project = {
          id: 'projectId',
        }
        team.version = {
          id: 'versionid',
        }

        const actual = mapper.teamToOnboard(team)

        expect(actual.addDeployment).toEqual(NOT_DONE)
      })

      test('should be done when there is a deployment', () => {
        const DEPLOYMENT_ID = 'deploymentId'

        const expected: OnboardingItemDto = { done: true, resourceId: DEPLOYMENT_ID }

        team.project = {
          id: 'projectId',
        }
        team.version = {
          id: 'versionid',
        }
        team.image = {
          config: {
            id: 'imageConfigId',
          },
        }
        team.deployment = {
          id: DEPLOYMENT_ID,
          status: 'preparing',
          node: {
            id: 'nodeId',
          },
        }

        const actual = mapper.teamToOnboard(team)

        expect(actual.addDeployment).toEqual(expected)
      })
    })

    describe('deploy', () => {
      test('should be false with a project with a version without deployments', () => {
        team.project = {
          id: 'projectId',
        }
        team.version = {
          id: 'versionid',
        }

        const actual = mapper.teamToOnboard(team)

        expect(actual.deploy).toEqual(NOT_DONE)
      })

      test('should be false with a project with a version with only preparing deployments', () => {
        const DEPLOYMENT_ID = 'deploymentId'

        team.project = {
          id: 'projectId',
        }
        team.version = {
          id: 'versionid',
        }
        team.image = {
          config: {
            id: 'imageConfigId',
          },
        }
        team.deployment = {
          id: DEPLOYMENT_ID,
          status: 'preparing',
          node: {
            id: 'nodeId',
          },
        }

        const actual = mapper.teamToOnboard(team)

        expect(actual.deploy).toEqual(NOT_DONE)
      })

      test('should be done, when the first deployment is not preparing', () => {
        const DEPLOYMENT_ID = 'deploymentId'

        const expected: OnboardingItemDto = { done: true }

        team.project = {
          id: 'projectId',
        }
        team.version = {
          id: 'versionid',
        }
        team.image = {
          config: {
            id: 'imageConfigId',
          },
        }
        team.deployment = {
          id: DEPLOYMENT_ID,
          status: 'successful',
          node: {
            id: 'nodeId',
          },
        }

        const actual = mapper.teamToOnboard(team)

        expect(actual.deploy).toEqual(expected)
      })
    })
  })
})
