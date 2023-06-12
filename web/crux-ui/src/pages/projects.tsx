import { Layout } from '@app/components/layout'
import EditProjectCard from '@app/components/projects/edit-project-card'
import ProjectViewList from '@app/components/projects/project-view-list'
import ProjectViewTile from '@app/components/projects/project-view-tile'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import Filters from '@app/components/shared/filters'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import ViewModeToggle, { ViewMode } from '@app/components/shared/view-mode-toggle'
import DyoFilterChips from '@app/elements/dyo-filter-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { TextFilter, textFilterFor, useFilters } from '@app/hooks/use-filters'
import { Project, ProjectType, PROJECT_TYPE_VALUES } from '@app/models'
import { API_PROJECTS, projectUrl, ROUTE_PROJECTS } from '@app/routes'
import { auditToLocaleDate, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

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

  const router = useRouter()
  const { t } = useTranslation('projects')

  const filters = useFilters<Project, ProjectFilter>({
    initialData: projects,
    filters: [
      textFilterFor<Project>(it => [it.name, it.description, it.type, auditToLocaleDate(it.audit)]),
      projectTypeFilter,
    ],
  })

  const [creating, setCreating] = useState(false)
  const submitRef = useRef<() => Promise<any>>()

  const [viewMode, setViewMode] = useState<ViewMode>('tile')

  const onCreated = async (project: Project) => {
    setCreating(false)
    filters.setItems([...filters.items, project])

    // When creating navigate the user to the project detail page
    await router.push(projectUrl(project.id))
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:projects'),
    url: ROUTE_PROJECTS,
  }

  return (
    <Layout title={t('common:projects')}>
      <PageHeading pageLink={pageLink}>
        <ListPageMenu creating={creating} setCreating={setCreating} submitRef={submitRef} />
      </PageHeading>
      {!creating ? null : (
        <EditProjectCard className="mb-8 px-8 py-6" submitRef={submitRef} onProjectEdited={onCreated} />
      )}

      {filters.items.length ? (
        <>
          <Filters setTextFilter={it => filters.setFilter({ text: it })}>
            <DyoFilterChips
              className="pl-6"
              choices={PROJECT_TYPE_VALUES}
              converter={it => t(it)}
              selection={filters.filter?.type}
              onSelectionChange={type => {
                filters.setFilter({
                  type,
                })
              }}
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

const getPageServerSideProps = async (context: NextPageContext) => {
  const projects = await getCruxFromContext<Project[]>(context, API_PROJECTS)

  return {
    props: {
      projects,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
