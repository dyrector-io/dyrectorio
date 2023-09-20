import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PROJECT_TYPE_VALUES, Project } from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ProjectTypeTag from './project-type-tag'
import DyoTable, { DyoColumn, sortDate, sortNumber, sortString } from '@app/elements/dyo-table'
import { enumSort } from '@app/hooks/use-sorting'

export interface ProjectViewListProps {
  projects: Project[]
}

type ProjectSorting = 'name' | 'versionCount' | 'updatedAt' | 'type'

const ProjectViewList = (props: ProjectViewListProps) => {
  const { projects } = props

  const { t } = useTranslation('projects')
  const routes = useTeamRoutes()
  const router = useRouter()

  const onRowClick = async it => await router.push(routes.project.details(it.id))

  return (
    <DyoCard className="relative mt-4">
      <DyoTable data={projects} onRowClick={onRowClick}>
        <DyoColumn header={t('name')} field="name" sortable sort={sortString} />
        <DyoColumn header={t('versions')} field="versionCount" width="8%" align="center" sortable sort={sortNumber} />
        <DyoColumn
          header={t('common:updatedAt')}
          body={(it: Project) => auditToLocaleDate(it.audit)}
          suppressHydrationWarning
          width="16%"
          sortable
          sort={sortDate}
          sortField={(it: Project) => it.audit.updatedAt ?? it.audit.createdAt}
        />
        <DyoColumn
          header={t('type')}
          body={(it: Project) => <ProjectTypeTag className="w-fit m-auto" type={it.type} />}
          align="center"
          width="16%"
          sortable
          sortField="type"
          sort={enumSort(PROJECT_TYPE_VALUES)}
        />
        <DyoColumn
          header={t('common:actions')}
          width="8%"
          align="center"
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
