import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoList } from '@app/elements/dyo-list'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PROJECT_TYPE_VALUES, Project } from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ProjectTypeTag from './project-type-tag'
import {
  auditFieldGetter,
  dateSort,
  enumSort,
  numberSort,
  sortHeaderBuilder,
  stringSort,
  useSorting,
} from '@app/hooks/use-sorting'

export interface ProjectViewListProps {
  projects: Project[]
}

type ProjectSorting = 'name' | 'versionCount' | 'updatedAt' | 'type'

const ProjectViewList = (props: ProjectViewListProps) => {
  const { projects } = props

  const { t } = useTranslation('projects')
  const routes = useTeamRoutes()
  const router = useRouter()

  const sorting = useSorting<Project, ProjectSorting>(projects, {
    initialField: 'name',
    initialDirection: 'asc',
    sortFunctions: {
      name: stringSort,
      versionCount: numberSort,
      updatedAt: dateSort,
      type: enumSort(PROJECT_TYPE_VALUES),
    },
    fieldGetters: {
      updatedAt: auditFieldGetter,
    },
  })

  const columnWidths = ['w-6/12', 'w-1/12', 'w-2/12', 'w-2/12', 'w-1/12']
  const headers = ['name', 'versions', 'common:updatedAt', 'type', 'common:actions']
  const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased px-2 py-3 h-11'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 3 }).map(() => defaultHeaderClass),
    clsx('text-center', defaultHeaderClass),
    clsx('rounded-tr-lg pr-6 text-center', defaultHeaderClass),
  ]
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headers.length - 3 }).map(() => defaultItemClass),
    clsx('text-center', defaultItemClass),
    clsx('pr-6 text-center', defaultItemClass),
  ]

  const onCellClick = async (data: Project, row: number, col: number) => {
    if (col >= headers.length - 1) {
      return
    }

    await router.push(routes.project.details(data.id))
  }

  const itemTemplate = (item: Project) => [
    <a>{item.name}</a>,
    <a>{item.versionCount}</a>,
    <a suppressHydrationWarning>{auditToLocaleDate(item.audit)}</a>,
    <div>
      <ProjectTypeTag className="w-fit m-auto" type={item.type} />
    </div>,
    <Link href={routes.project.details(item.id)} passHref>
      <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
    </Link>,
  ]

  return (
    <DyoCard className="relative mt-4">
      <DyoList
        headers={[...headers, '']}
        headerClassName={headerClasses}
        columnWidths={columnWidths}
        itemClassName={itemClasses}
        data={sorting.items}
        noSeparator
        itemBuilder={itemTemplate}
        headerBuilder={sortHeaderBuilder<Project, ProjectSorting>(
          sorting,
          {
            name: 'name',
            versions: 'versionCount',
            'common:updatedAt': 'updatedAt',
            type: 'type',
          },
          text => t(text),
        )}
        cellClick={onCellClick}
      />
    </DyoCard>
  )
}

export default ProjectViewList
