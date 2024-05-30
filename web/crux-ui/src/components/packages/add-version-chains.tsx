import DyoButton from '@app/elements/dyo-button'
import DyoCheckbox from '@app/elements/dyo-checkbox'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoList } from '@app/elements/dyo-list'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PackageVersionChain, Project, VersionChain } from '@app/models'
import { fetcher } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import useSWR from 'swr'
import SelectProjectChips from '../projects/select-project-chips'

type AddVersionChainsProps = {
  className?: string
  currentChains: PackageVersionChain[]
  onAdd: (chains: PackageVersionChain[]) => void
  onDiscard: VoidFunction
}

const AddVersionChains = (props: AddVersionChainsProps) => {
  const { className, currentChains, onAdd: propsOnAdd, onDiscard } = props

  const { t } = useTranslation('packages')
  const routes = useTeamRoutes()

  const [project, setProject] = useState<Project>(null)
  const [selected, setSelected] = useState<PackageVersionChain[]>([])

  const { data: fetchedChains, error: fetchVersionChainsError } = useSWR<VersionChain[]>(
    project ? routes.project.api.versionChains(project.id) : null,
    fetcher,
  )

  const ignoredChainIds = currentChains.map(it => it.id)
  const selectedIds = selected.map(it => it.id)

  const versionChains: PackageVersionChain[] = [
    ...selected,
    ...(fetchedChains ?? [])
      .filter(it => !ignoredChainIds.includes(it.id) && !selectedIds.includes(it.id))
      .map(it => ({
        ...it,
        project,
      })),
  ]

  const onProjectsFetched = (projects: Project[] | null) => {
    if (!projects || project || projects.length < 1) {
      return
    }

    setProject(projects[0])
  }

  const onProjectSelected = async (proj: Project) => {
    setProject(proj)
  }

  const onAdd = () => propsOnAdd(selected)

  const onChainCheckedChange = (selectable: PackageVersionChain, checked: boolean) => {
    if (checked) {
      if (selected.find(it => it.id === selectable.id)) {
        return
      }

      const newSelected = [...selected, selectable]
      setSelected(newSelected)
      return
    }

    const newSelected = selected.filter(it => it.id !== selectable.id)
    setSelected(newSelected)
  }

  const itemTemplate = (selectable: PackageVersionChain, index: number) => {
    const checked = !!selected.find(it => it.id === selectable.id)
    const onCheckedChange = isChecked => onChainCheckedChange(selectable, isChecked)

    /* eslint-disable react/jsx-key */
    return [
      <div className="flex flex-row p-auto">
        <DyoCheckbox
          className="my-auto mr-2"
          checked={!!checked}
          onCheckedChange={onCheckedChange}
          qaLabel={`chain-${index}`}
        />

        <DyoLabel onClick={() => onCheckedChange(!checked)}>{selectable.project.name}</DyoLabel>
      </div>,
      <DyoLabel onClick={() => onCheckedChange(!checked)}>{selectable.earliest.name}</DyoLabel>,
      <DyoLabel onClick={() => onCheckedChange(!checked)}>{selectable.latest.name}</DyoLabel>,
    ]
    /* eslint-enable react/jsx-key */
  }

  return (
    <div className={clsx(className, 'flex flex-col')}>
      <div className="flex flex-row">
        <DyoHeading element="h4" className="text-lg text-bright">
          {t('addVersionChains')}
        </DyoHeading>

        <DyoButton outlined secondary className="ml-auto mr-2 px-10" onClick={onDiscard}>
          {t('common:discard')}
        </DyoButton>

        <DyoButton disabled={selected.length < 1} outlined className="ml-2 px-10" onClick={onAdd}>
          {t('common:add')}
        </DyoButton>
      </div>

      <DyoLabel className="mt-4 mb-2.5">{t('common:projects')}</DyoLabel>

      <SelectProjectChips
        name="projects"
        types={['versioned']}
        selection={project}
        onProjectsFetched={onProjectsFetched}
        onSelectionChange={onProjectSelected}
      />

      {fetchVersionChainsError ? (
        <DyoLabel className="mt-2">
          {t('errors:fetchFailed', {
            type: t('versionChains'),
          })}
        </DyoLabel>
      ) : (
        <DyoList
          className="mt-4"
          data={versionChains}
          headers={['common:project', 'earliest', 'latest'].map(it => t(it))}
          itemBuilder={itemTemplate}
        />
      )}
    </div>
  )
}

export default AddVersionChains
