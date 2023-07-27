import { Layout } from '@app/components/layout'
import EditProjectCard from '@app/components/projects/edit-project-card'
import ProjectDetailsCard from '@app/components/projects/project-details-card'
import ProjectVersionsSection from '@app/components/projects/project-versions-section'
import EditVersionCard from '@app/components/projects/versions/edit-version-card'
import IncreaseVersionCard from '@app/components/projects/versions/increase-version-card'
import VersionlessProjectSections from '@app/components/projects/versions/versionless-project-sections'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu, DetailsPageTexts } from '@app/components/shared/page-menu'
import DyoButton from '@app/elements/dyo-button'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import WebSocketSaveIndicator from '@app/elements/web-socket-save-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  EditableProject,
  EditableVersion,
  ProjectDetails,
  projectDetailsToEditableProject,
  updateProjectDetailsWithEditableProject,
  Version,
  VersionDetails,
  WebSocketSaveState,
} from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import clsx from 'clsx'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

interface ProjectDetailsPageProps {
  project: ProjectDetails
  versionlessProjectVersionDetails?: VersionDetails
}

const ProjectDetailsPage = (props: ProjectDetailsPageProps) => {
  const { project: propsProject, versionlessProjectVersionDetails } = props

  const { t } = useTranslation('projects')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [project, setProject] = useState(propsProject)
  const [editState, setEditState] = useState<ProjectDetailsEditState>('version-list')
  const [increaseTarget, setIncreaseTarget] = useState<Version>(null)
  const [saveState, setSaveState] = useState<WebSocketSaveState>(null)
  const [topBarContent, setTopBarContent] = useState<React.ReactNode>(null)

  const submitRef = useRef<() => Promise<any>>()

  const [convertModelConfig, confirmConvert] = useConfirmation()

  const versionless = project.type === 'versionless'

  const handleApiError = defaultApiErrorHandler(t)

  const onProjectEdited = (edit: EditableProject) => {
    const newProject = updateProjectDetailsWithEditableProject(project, edit)
    setEditState('version-list')
    setProject(newProject)
  }

  const onDelete = async () => {
    const res = await fetch(routes.project.api.details(project.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(routes.project.list())
    } else {
      toast(t('errors:oops'))
    }
  }

  const onAddVersion = () => setEditState('add-version')

  const onVersionCreated = (version: EditableVersion) => {
    const newVersions = [
      ...project.versions,
      {
        ...version,
        default: project.versions.length < 1,
        increasable: version.type === 'incremental',
      },
    ]

    setProject({
      ...project,
      versions: newVersions,
    })
    setEditState('version-list')
  }

  const onIncreaseVersion = (version: Version) => {
    setIncreaseTarget(version)
    setEditState('increase-version')
  }

  const onSetDefaultVersion = async (version: Version) => {
    const res = await fetch(routes.project.versions(project.id).api.setAsDefault(version.id), {
      method: 'PUT',
    })

    if (!res.ok) {
      handleApiError(res)
      return
    }

    const newVersions = project.versions.map(it => ({
      ...it,
      default: it.id === version.id,
    }))

    setProject({
      ...project,
      versions: newVersions,
    })
  }

  const onVersionIncreased = async (version: Version) =>
    await router.push(routes.project.versions(project.id).details(version.id))

  const onConvertToVersioned = async () => {
    if (project.type === 'versioned') {
      return
    }

    const confirmed = await confirmConvert({
      title: t('convertProjectToVersioned', { name: project.name }),
      description: t('areYouSureWantToConvert'),
      confirmColor: 'bg-warning-orange',
    })

    if (!confirmed) {
      return
    }

    const res = await fetch(routes.project.api.convertToVersioned(project.id), {
      method: 'POST',
    })

    if (res.ok) {
      await router.reload()
    } else {
      toast(t('errors:oops'))
    }
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:projects'),
    url: routes.project.list(),
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: project.name,
      url: routes.project.details(project.id),
    },
  ]

  const pageMenuTexts: DetailsPageTexts = {
    addDetailsItem: t('addVersion'),
  }

  return (
    <Layout title={t('projectsName', project)} topBarContent={topBarContent}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        {project.type === 'versionless' && <WebSocketSaveIndicator className="mx-3" state={saveState} />}

        <DetailsPageMenu
          texts={pageMenuTexts}
          onAdd={versionless ? null : onAddVersion}
          onDelete={project.deletable ? onDelete : null}
          editing={editState !== 'version-list'}
          setEditing={editing => setEditState(editing ? 'edit-project' : 'version-list')}
          submitRef={submitRef}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: project.name })}
          deleteModalDescription={t('proceedYouLoseAllDataToName', {
            name: project.name,
          })}
        >
          {editState !== 'version-list' && versionless && (
            <DyoButton className="px-2 mx-2" outlined onClick={onConvertToVersioned}>
              {t('convertToVersioned')}
            </DyoButton>
          )}
        </DetailsPageMenu>
      </PageHeading>

      {editState === 'version-list' ? (
        <ProjectDetailsCard project={project} className={clsx('p-6', versionless ? 'mb-4' : null)} />
      ) : editState === 'edit-project' ? (
        <EditProjectCard
          className="mb-8 px-8 py-6"
          project={projectDetailsToEditableProject(project)}
          onProjectEdited={onProjectEdited}
          submitRef={submitRef}
        />
      ) : editState === 'add-version' ? (
        <EditVersionCard
          className="mb-8 px-8 py-6"
          project={project}
          submitRef={submitRef}
          onVersionEdited={onVersionCreated}
        />
      ) : (
        <IncreaseVersionCard
          className="mb-8 px-8 py-6"
          project={project}
          parent={increaseTarget}
          onVersionIncreased={onVersionIncreased}
          submitRef={submitRef}
        />
      )}

      {versionless ? (
        <VersionlessProjectSections
          project={project}
          version={versionlessProjectVersionDetails}
          setSaveState={setSaveState}
          setTopBarContent={setTopBarContent}
        />
      ) : editState === 'version-list' ? (
        <ProjectVersionsSection
          projectId={project.id}
          versions={project.versions}
          onIncrease={onIncreaseVersion}
          onSetAsDefault={onSetDefaultVersion}
        />
      ) : editState === 'add-version' || editState === 'edit-project' ? (
        <ProjectVersionsSection disabled projectId={project.id} versions={project.versions} />
      ) : null}

      {versionless && <DyoConfirmationModal config={convertModelConfig} className="w-1/4" />}
    </Layout>
  )
}

export default ProjectDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const projectId = context.query.projectId as string

  const project = await getCruxFromContext<ProjectDetails>(context, routes.project.api.details(projectId))

  const props: ProjectDetailsPageProps = {
    project,
    versionlessProjectVersionDetails: null,
  }

  if (project.type === 'versionless') {
    const version = project.versions[0]

    props.versionlessProjectVersionDetails = await getCruxFromContext<VersionDetails>(
      context,
      routes.project.versions(projectId).details(version.id),
    )
  }

  return {
    props,
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)

type ProjectDetailsEditState = 'version-list' | 'edit-project' | 'add-version' | 'increase-version'
