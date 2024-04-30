import DyoChips from '@app/elements/dyo-chips'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Project, ProjectType } from '@app/models'
import { fetcher } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import useSWR from 'swr'

type SelectProjectChipsProps = {
  className?: string
  name: string
  types?: ProjectType[]
  selection: Project | null
  onSelectionChange: (project: Project) => Promise<void>
  errorMessage?: string | null
  onProjectsFetched?: (projects: Project[] | null) => void
}

const SelectProjectChips = (props: SelectProjectChipsProps) => {
  const {
    className,
    name,
    selection,
    onSelectionChange,
    errorMessage,
    onProjectsFetched,
    types = ['versioned', 'versionless'],
  } = props

  const { t } = useTranslation('common')
  const routes = useTeamRoutes()

  const { data: projectsData, error: fetchProjectsError } = useSWR<Project[]>(routes.project.api.list(), fetcher)
  const projects = projectsData?.filter(it => types.includes(it.type))

  useEffect(() => {
    onProjectsFetched?.call(null, projects)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  return fetchProjectsError ? (
    <DyoLabel>
      {t('errors:fetchFailed', {
        type: t('common:projects'),
      })}
    </DyoLabel>
  ) : !projects ? (
    <DyoLabel>{t('common:loading')}</DyoLabel>
  ) : projects.length === 0 ? (
    <DyoMessage message={t('common:noNameFound', { name: t('common:projects') })} messageType="error" />
  ) : !projects ? (
    <DyoLabel>{t('common:loading')}</DyoLabel>
  ) : (
    <>
      <DyoChips
        className={className}
        name={name}
        choices={projects ?? []}
        converter={(it: Project) => it.name}
        selection={selection}
        onSelectionChange={onSelectionChange}
      />
      {errorMessage && <DyoMessage message={errorMessage} messageType="error" />}
    </>
  )
}

export default SelectProjectChips
