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
      projects: [],
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

      test('should be done and contain the first project id, when there are projects', () => {
        const PROJECT_ID = 'projectId'

        const expected: OnboardingItemDto = { done: true, resourceId: PROJECT_ID }

        team.projects = [
          {
            id: PROJECT_ID,
            versions: [],
          },
          {
            id: 'project-2',
            versions: [],
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.createProject).toEqual(expected)
      })
    })

    describe('createVersion', () => {
      test('should be false with a project without a version', () => {
        team.projects = [
          {
            id: 'projectId',
            versions: [],
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.createVersion).toEqual(NOT_DONE)
      })

      test('should be done and contain the first version id, when there are multiple versions', () => {
        const VERSION_ID = 'versionId'

        const expected: OnboardingItemDto = { done: true, resourceId: VERSION_ID }

        team.projects = [
          {
            id: 'projectId',
            versions: [
              {
                id: VERSION_ID,
                deployments: [],
                images: [],
              },
              {
                id: 'verion-2',
                deployments: [],
                images: [],
              },
            ],
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.createVersion).toEqual(expected)
      })
    })

    describe('addImages', () => {
      test('should be false with a project with a version without images', () => {
        team.projects = [
          {
            id: 'projectId',
            versions: [
              {
                id: 'versionId',
                deployments: [],
                images: [],
              },
            ],
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.addImages).toEqual(NOT_DONE)
      })

      test('should be done and contain the first image id, when there are multiple images', () => {
        const IMAGE_ID = 'imageId'

        const expected: OnboardingItemDto = { done: true, resourceId: IMAGE_ID }

        team.projects = [
          {
            id: 'projectId',
            versions: [
              {
                id: 'versionId',
                deployments: [],
                images: [
                  {
                    id: IMAGE_ID,
                  },
                  {
                    id: 'image-2',
                  },
                ],
              },
            ],
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.addImages).toEqual(expected)
      })
    })

    describe('addDeployment', () => {
      test('should be false with a project with a version without deployments', () => {
        team.projects = [
          {
            id: 'projectId',
            versions: [
              {
                id: 'versionId',
                deployments: [],
                images: [],
              },
            ],
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.addDeployment).toEqual(NOT_DONE)
      })

      test('should be done and contain the first deployment id, when there are multiple deployments', () => {
        const DEPLOYMENT_ID = 'deploymentId'

        const expected: OnboardingItemDto = { done: true, resourceId: DEPLOYMENT_ID }

        team.projects = [
          {
            id: 'projectId',
            versions: [
              {
                id: 'versionId',
                deployments: [
                  {
                    id: DEPLOYMENT_ID,
                    status: 'preparing',
                  },
                  {
                    id: 'image-2',
                    status: 'failed',
                  },
                ],
                images: [],
              },
            ],
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.addDeployment).toEqual(expected)
      })
    })

    describe('deploy', () => {
      test('should be false with a project with a version without deployments', () => {
        team.projects = [
          {
            id: 'projectId',
            versions: [
              {
                id: 'versionId',
                deployments: [],
                images: [],
              },
            ],
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.deploy).toEqual(NOT_DONE)
      })

      test('should be false with a project with a version with only preparing deployments', () => {
        const DEPLOYMENT_ID = 'deploymentId'

        team.projects = [
          {
            id: 'projectId',
            versions: [
              {
                id: 'versionId',
                deployments: [
                  {
                    id: DEPLOYMENT_ID,
                    status: 'preparing',
                  },
                ],
                images: [],
              },
            ],
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.deploy).toEqual(NOT_DONE)
      })

      test('should be done, when the first deployment is not preparing', () => {
        const DEPLOYMENT_ID = 'deploymentId'

        const expected: OnboardingItemDto = { done: true }

        team.projects = [
          {
            id: 'projectId',
            versions: [
              {
                id: 'versionId',
                deployments: [
                  {
                    id: DEPLOYMENT_ID,
                    status: 'successful',
                  },
                  {
                    id: 'image-2',
                    status: 'preparing',
                  },
                ],
                images: [],
              },
            ],
          },
        ]

        const actual = mapper.teamToOnboard(team)

        expect(actual.deploy).toEqual(expected)
      })
    })
  })
})
