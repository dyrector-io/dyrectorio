import { Layout } from '@app/components/layout'
import EditProjectCard from '@app/components/projects/edit-project-card'
import ProjectViewList from '@app/components/projects/project-view-list'
import ProjectViewTile from '@app/components/projects/project-view-tile'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import ViewModeToggle from '@app/components/shared/view-mode-toggle'
import { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import useAnchor from '@app/hooks/use-anchor'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import usePersistedViewMode from '@app/hooks/use-persisted-view-mode'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PROJECT_TYPE_VALUES, Project, ProjectType } from '@app/models'
import { ANCHOR_NEW, ListRouteOptions, TeamRoutes } from '@app/routes'
import { auditToLocaleDate, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

type ProjectFilter = TextFilter & {
  type?: ProjectType | 'all'
}

const projectTypeFilter = (items: Project[], filter: ProjectFilter) => {
  if (!filter?.type || filter.type === 'all') {
    return items
  }
  return items.filter(it => filter.type.includes(it.type))
}

interface ProjectsPageProps {
  projects: Project[]
}

const ProjectsPage = (props: ProjectsPageProps) => {
  const { projects } = props

  const { t } = useTranslation('projects')
  const routes = useTeamRoutes()
  const router = useRouter()
  const anchor = useAnchor()

  const filters = useFilters<Project, ProjectFilter>({
    initialData: projects,
    filters: [
      textFilterFor<Project>(it => [it.name, it.description, it.type, auditToLocaleDate(it.audit)]),
      projectTypeFilter,
    ],
  })

  const creating = anchor === ANCHOR_NEW
  const submit = useSubmit()

  const [viewMode, setViewMode] = usePersistedViewMode({ initialViewMode: 'tile', pageName: 'projects' })

  const onProjectCreated = async (project: Project) => {
    // When creating navigate the user to the project detail page
    await router.push(routes.project.details(project.id))
  }

  const onRouteOptionsChange = async (routeOptions: ListRouteOptions) => {
    await router.replace(routes.project.list(routeOptions))
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:projects'),
    url: routes.project.list(),
  }

  return (
    <Layout title={t('common:projects')}>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} onRouteOptionsChange={onRouteOptionsChange} submit={submit} />
      </PageHeading>
      {!creating ? null : (
        <EditProjectCard className="mb-8 px-8 py-6" submit={submit} onProjectEdited={onProjectCreated} />
      )}

      {filters.items.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })}>
            <DyoFilterChips
              className="pl-6"
              name="projectTypeFilter"
              choices={PROJECT_TYPE_VALUES}
              converter={it => t(it)}
              selection={filters.filter?.type}
              onSelectionChange={type => {
                filters.setFilter({
                  type,
                })
              }}
              qaLabel={chipsQALabelFromValue}
            />
          </Filters>
          <div className="flex flex-row mt-4 justify-end">
            <ViewModeToggle viewMode={viewMode} onViewModeChanged={setViewMode} />
          </div>

          {viewMode === 'tile' ? (
            <ProjectViewTile projects={filters.filtered} />
          ) : (
            <ProjectViewList projects={filters.filtered} />
          )}
        </>
      ) : (
        <DyoHeading element="h3" className="text-md text-center text-light-eased pt-32">
          {t('noItems')}
        </DyoHeading>
      )}
    </Layout>
  )
}
export default ProjectsPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const projects = await getCruxFromContext<Project[]>(context, routes.project.api.list())

  return {
    props: {
      projects,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
