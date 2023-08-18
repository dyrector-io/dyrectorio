import { Layout } from '@app/components/layout'
import ProjectVersionsSection from '@app/components/projects/project-versions-section'
import EditVersionCard from '@app/components/projects/versions/edit-version-card'
import { useVersionState } from '@app/components/projects/versions/use-version-state'
import VersionDetailsCard from '@app/components/projects/versions/version-details-card'
import VersionSections, { parseVersionSectionState } from '@app/components/projects/versions/version-sections'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { DetailsPageMenu } from '@app/components/shared/page-menu'
import WebSocketSaveIndicator from '@app/elements/web-socket-save-indicator'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { EditableVersion, ProjectDetails, VersionDetails } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { anchorLinkOf, redirectTo, searchParamsOf, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'

interface VersionDetailsPageProps {
  project: ProjectDetails
  version: VersionDetails
}

const VersionDetailsPage = (props: VersionDetailsPageProps) => {
  const { project, version: propsVersion } = props

  const { t } = useTranslation('versions')
  const routes = useTeamRoutes()
  const router = useRouter()

  const [allVersions, setAllVersions] = useState(project.versions)
  const [version, setVersion] = useState(propsVersion)
  const [editing, setEditing] = useState(anchorLinkOf(router) === '#edit')
  const [topBarContent, setTopBarContent] = useState<React.ReactNode>(null)
  const submitRef = useRef<() => Promise<any>>()

  const initialSection = parseVersionSectionState(router.query.section as string, 'images')
  const [state, actions] = useVersionState({
    initialSection,
    projectId: project.id,
    version,
  })

  const onVersionEdited = async (newVersion: EditableVersion) => {
    setEditing(false)
    setVersion({
      ...version,
      ...newVersion,
    })

    const newAllVersion = [...allVersions]
    const index = newAllVersion.findIndex(it => it.id === newVersion.id)
    const oldVersion = newAllVersion[index]
    newAllVersion[index] = {
      ...newVersion,
      default: oldVersion.default,
    }
    setAllVersions(newAllVersion)
  }

  const onDelete = async () => {
    const res = await fetch(routes.project.versions(project.id).details(version.id), {
      method: 'DELETE',
    })

    if (res.ok) {
      router.replace(routes.project.details(project.id))
    } else {
      toast(t('errors:oops'))
    }
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:versions'),
    url: routes.project.list(),
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: project.name,
      url: routes.project.details(project.id),
    },
    {
      name: version.name,
      url: routes.project.versions(project.id).details(version.id),
    },
  ]

  return (
    <Layout title={t('versionsName', { project: project.name, name: version.name })} topBarContent={topBarContent}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <WebSocketSaveIndicator className="mx-3" state={state.saveState} />

        {!version.deletable && !version.mutable ? null : (
          <DetailsPageMenu
            onDelete={version.deletable ? onDelete : null}
            editing={editing}
            setEditing={setEditing}
            disableEditing={!version.mutable}
            submitRef={submitRef}
            deleteModalTitle={t('common:areYouSureDeleteName', { name: version.name })}
            deleteModalDescription={t('proceedYouLoseAllDataToName', {
              name: version.name,
            })}
          />
        )}
      </PageHeading>

      {!editing ? (
        <VersionDetailsCard version={version} className="mb-4 p-6" />
      ) : (
        <EditVersionCard
          className="mb-8 px-8 py-6"
          project={project}
          version={version}
          submitRef={submitRef}
          onVersionEdited={onVersionEdited}
        />
      )}

      {editing ? (
        <ProjectVersionsSection projectId={project.id} versions={allVersions} disabled />
      ) : (
        <VersionSections project={project} state={state} actions={actions} setTopBarContent={setTopBarContent} />
      )}
    </Layout>
  )
}

export default VersionDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const projectId = context.query.projectId as string
  const versionId = context.query.versionId as string

  const project = await getCruxFromContext<ProjectDetails>(context, routes.project.api.details(projectId))
  if (project.type === 'versionless') {
    return redirectTo(`${routes.project.details(project.id)}${searchParamsOf(context)}`)
  }

  const version = await getCruxFromContext<VersionDetails>(
    context,
    routes.project.versions(projectId).api.details(versionId),
  )

  return {
    props: {
      project,
      version,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
