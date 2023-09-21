import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PROJECT_TYPE_VALUES, Project } from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ProjectTypeTag from './project-type-tag'
import DyoTable, { DyoColumn, sortDate, sortEnum, sortNumber, sortString } from '@app/elements/dyo-table'

export interface ProjectViewListProps {
  projects: Project[]
}

const ProjectViewList = (props: ProjectViewListProps) => {
  const { projects } = props

  const { t } = useTranslation('projects')
  const routes = useTeamRoutes()
  const router = useRouter()

  const onRowClick = async it => await router.push(routes.project.details(it.id))

  return (
    <DyoCard className="relative mt-4">
      <DyoTable data={projects} dataKey="id" onRowClick={onRowClick} initialSortColumn={0} initialSortDirection="asc">
        <DyoColumn header={t('name')} field="name" className="w-6/12" sortable sort={sortString} />
        <DyoColumn
          header={t('versions')}
          field="versionCount"
          className="w-1/12 text-center"
          sortable
          sort={sortNumber}
        />
        <DyoColumn
          header={t('common:updatedAt')}
          body={(it: Project) => auditToLocaleDate(it.audit)}
          suppressHydrationWarning
          className="w-2/12"
          sortable
          sort={sortDate}
          sortField={(it: Project) => it.audit.updatedAt ?? it.audit.createdAt}
        />
        <DyoColumn
          header={t('type')}
          body={(it: Project) => <ProjectTypeTag className="w-fit m-auto" type={it.type} />}
          className="w-2/12 text-center"
          sortable
          sortField="type"
          sort={sortEnum(PROJECT_TYPE_VALUES)}
        />
        <DyoColumn
          header={t('common:actions')}
          className="w-40 text-center"
          preventClickThrough
          body={(it: Project) => (
            <Link href={routes.project.details(it.id)} passHref>
              <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
            </Link>
          )}
        />
      </DyoTable>
    </DyoCard>
  )
}

export default ProjectViewList
