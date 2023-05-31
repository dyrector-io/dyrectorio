import { Layout } from '@app/components/layout'
import EditProjectCard from '@app/components/projects/edit-product-card'
import ProjectDetailsCard from '@app/components/projects/product-details-card'
import ProjectVersionsSection from '@app/components/projects/product-versions-section'
import EditVersionCard from '@app/components/projects/versions/edit-version-card'
import IncreaseVersionCard from '@app/components/projects/versions/increase-version-card'
import { SimpleVersionSections } from '@app/components/projects/versions/simple-version-sections'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu, DetailsPageTexts } from '@app/components/shared/page-menu'
import LoadingIndicator from '@app/elements/loading-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import {
  EditableProject,
  EditableVersion,
  ProjectDetails,
  projectDetailsToEditableProject,
  updateProjectDetailsWithEditableProject,
  Version,
  VersionDetails,
} from '@app/models'
import {
  projectApiUrl,
  projectUrl,
  ROUTE_PROJECTS,
  versionApiUrl,
  versionSetDefaultApiUrl,
  versionUrl,
} from '@app/routes'
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
  simpleProjectVersionDetails?: VersionDetails
}

const ProjectDetailsPage = (props: ProjectDetailsPageProps) => {
  const { project: propsProject, simpleProjectVersionDetails } = props

  const { t } = useTranslation('projects')
  const router = useRouter()

  const [project, setProject] = useState(propsProject)
  const [editState, setEditState] = useState<ProjectDetailsEditState>('version-list')
  const [increaseTarget, setIncreaseTarget] = useState<Version>(null)
  const [saving, setSaving] = useState(false)
  const [topBarContent, setTopBarContent] = useState<React.ReactNode>(null)

  const submitRef = useRef<() => Promise<any>>()

  const simpleProject = project.type === 'simple'

  const handleApiError = defaultApiErrorHandler(t)

  const onProjectEdited = (edit: EditableProject) => {
    const newProject = updateProjectDetailsWithEditableProject(project, edit)
    setEditState('version-list')
    setProject(newProject)
  }

  const onDelete = async () => {
    const res = await fetch(projectApiUrl(project.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(ROUTE_PROJECTS)
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
    const res = await fetch(versionSetDefaultApiUrl(project.id, version.id), {
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

  const onVersionIncreased = async (version: Version) => await router.push(versionUrl(project.id, version.id))

  const pageLink: BreadcrumbLink = {
    name: t('common:projects'),
    url: ROUTE_PROJECTS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: project.name,
      url: projectUrl(project.id),
    },
  ]

  const pageMenuTexts: DetailsPageTexts = {
    addDetailsItem: t('addVersion'),
  }

  return (
    <Layout title={t('projectsName', project)} topBarContent={topBarContent}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        {saving ? <LoadingIndicator className="flex ml-4 my-auto" /> : null}

        <DetailsPageMenu
          texts={pageMenuTexts}
          onAdd={simpleProject ? null : onAddVersion}
          onDelete={project.deletable ? onDelete : null}
          editing={editState !== 'version-list'}
          setEditing={editing => setEditState(editing ? 'edit-project' : 'version-list')}
          submitRef={submitRef}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: project.name })}
          deleteModalDescription={t('proceedYouLoseAllDataToName', {
            name: project.name,
          })}
        />
      </PageHeading>

      {editState === 'version-list' ? (
        <ProjectDetailsCard project={project} className={clsx('p-6', simpleProject ? 'mb-4' : null)} />
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

      {simpleProject ? (
        <SimpleVersionSections
          project={project}
          version={simpleProjectVersionDetails}
          setSaving={setSaving}
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
    </Layout>
  )
}

export default ProjectDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const projectId = context.query.projectId as string

  const project = await getCruxFromContext<ProjectDetails>(context, projectApiUrl(projectId))

  const props: ProjectDetailsPageProps = {
    project,
    simpleProjectVersionDetails: null,
  }

  if (project.type === 'simple') {
    const version = project.versions[0]

    props.simpleProjectVersionDetails = await getCruxFromContext<VersionDetails>(
      context,
      versionApiUrl(projectId, version.id),
    )
  }

  return {
    props,
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)

type ProjectDetailsEditState = 'version-list' | 'edit-project' | 'add-version' | 'increase-version'
