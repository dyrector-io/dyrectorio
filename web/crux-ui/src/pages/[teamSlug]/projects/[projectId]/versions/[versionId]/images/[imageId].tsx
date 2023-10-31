import EditorBadge from '@app/components/editor/editor-badge'
import useEditorState from '@app/components/editor/use-editor-state'
import useItemEditorState from '@app/components/editor/use-item-editor-state'
import { Layout } from '@app/components/layout'
import CommonConfigSection from '@app/components/projects/versions/images/config/common-config-section'
import configToFilters from '@app/components/projects/versions/images/config/config-to-filters'
import CraneConfigSection from '@app/components/projects/versions/images/config/crane-config-section'
import DagentConfigSection from '@app/components/projects/versions/images/config/dagent-config-section'
import EditImageJson from '@app/components/projects/versions/images/edit-image-json'
import ImageConfigFilters from '@app/components/projects/versions/images/image-config-filters'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoMessage from '@app/elements/dyo-message'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import WebSocketSaveIndicator from '@app/elements/web-socket-save-indicator'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { useThrottling } from '@app/hooks/use-throttleing'
import useWebSocket from '@app/hooks/use-websocket'
import {
  ContainerConfigData,
  DeleteImageMessage,
  ImageConfigProperty,
  imageConfigToJsonContainerConfig,
  ImageUpdateMessage,
  JsonContainerConfig,
  mergeJsonConfigToImageContainerConfig,
  PatchImageMessage,
  ProjectDetails,
  VersionDetails,
  VersionImage,
  ViewState,
  WebSocketSaveState,
  WS_TYPE_DELETE_IMAGE,
  WS_TYPE_IMAGE_UPDATED,
  WS_TYPE_PATCH_IMAGE,
  WS_TYPE_PATCH_RECEIVED,
} from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { ContainerConfigValidationErrors, getContainerConfigFieldErrors, jsonErrorOf } from '@app/validations'
import { WsMessage } from '@app/websockets/common'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { QA_DIALOG_LABEL_DELETE_IMAGE } from 'quality-assurance'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ImageDetailsPageProps {
  project: ProjectDetails
  version: VersionDetails
  image: VersionImage
}

const ImageDetailsPage = (props: ImageDetailsPageProps) => {
  const { image, project, version } = props

  const { t } = useTranslation('images')
  const routes = useTeamRoutes()

  const [config, setConfig] = useState<ContainerConfigData>(image.config)
  const [viewState, setViewState] = useState<ViewState>('editor')
  const [fieldErrors, setFieldErrors] = useState<ContainerConfigValidationErrors>(() =>
    getContainerConfigFieldErrors(image.config, t),
  )
  const [jsonError, setJsonError] = useState(jsonErrorOf(fieldErrors))
  const [topBarContent, setTopBarContent] = useState<React.ReactNode>(null)
  const [saveState, setSaveState] = useState<WebSocketSaveState>(null)

  const [filters, setFilters] = useState<ImageConfigProperty[]>(configToFilters([], config, fieldErrors))

  const patch = useRef<Partial<ContainerConfigData>>({})
  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)
  const router = useRouter()
  const [deleteModalConfig, confirmDelete] = useConfirmation()
  const versionSock = useWebSocket(routes.project.versions(project.id).detailsSocket(version.id), {
    onOpen: () => setSaveState('connected'),
    onClose: () => setSaveState('disconnected'),
    onReceive: (message: WsMessage) => {
      if (message.type === WS_TYPE_PATCH_RECEIVED) {
        setSaveState('saved')
      }
    },
  })

  const editor = useEditorState(versionSock)
  const editorState = useItemEditorState(editor, versionSock, image.id)

  useEffect(() => {
    const reactNode = (
      <>
        {editorState.editors.map((it, index) => (
          <EditorBadge key={index} className="mr-2" editor={it} />
        ))}
      </>
    )

    setTopBarContent(reactNode)
  }, [editorState.editors])

  useEffect(() => {
    setFilters(current => configToFilters(current, config))
  }, [config])

  const setErrorsForConfig = useCallback(
    newConfig => {
      const errors = getContainerConfigFieldErrors(newConfig, t)
      setFieldErrors(errors)
      setJsonError(jsonErrorOf(errors))
    },
    [t],
  )

  const onChange = (newConfig: Partial<ContainerConfigData>) => {
    setSaveState('saving')

    const value = { ...config, ...newConfig }
    setConfig(value)
    setErrorsForConfig(value)

    const newPatch = {
      ...patch.current,
      ...newConfig,
    }
    patch.current = newPatch

    throttle(() => {
      versionSock.send(WS_TYPE_PATCH_IMAGE, {
        id: image.id,
        config: patch.current,
      } as PatchImageMessage)

      patch.current = {}
    })
  }

  const onResetSection = (section: ImageConfigProperty) => {
    const newConfig = { ...config } as any
    newConfig[section] = section === 'user' ? -1 : null

    setConfig(newConfig)
    setErrorsForConfig(newConfig)

    versionSock.send(WS_TYPE_PATCH_IMAGE, {
      id: image.id,
      resetSection: section,
    } as PatchImageMessage)
  }

  versionSock.on(WS_TYPE_IMAGE_UPDATED, (message: ImageUpdateMessage) => {
    if (message.id !== image.id) {
      return
    }

    const newConfig = {
      ...config,
      ...message.config,
    }

    setConfig(newConfig)
    setErrorsForConfig(newConfig)
  })

  const onDelete = async () => {
    const confirmed = await confirmDelete({
      qaLabel: QA_DIALOG_LABEL_DELETE_IMAGE,
      title: t('common:areYouSureDeleteName', { name: image.name }),
      description: t('common:proceedYouLoseAllDataToName', { name: image.name }),
      confirmText: t('common:delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    versionSock.send(WS_TYPE_DELETE_IMAGE, {
      imageId: image.id,
    } as DeleteImageMessage)

    await router.replace(routes.project.versions(project.id).details(version.id))
  }

  const pageLink: BreadcrumbLink = {
    name: t('common:image'),
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
    {
      name: image.name,
      url: routes.project.versions(project.id).imageDetails(version.id, image.id),
    },
  ]

  const getViewStateButtons = () => (
    <div className="flex">
      <DyoButton
        text
        thin
        textColor="text-bright"
        underlined={viewState === 'editor'}
        onClick={() => setViewState('editor')}
        heightClassName="pb-2"
        className="mx-8"
      >
        {t('editor')}
      </DyoButton>

      <DyoButton
        text
        thin
        textColor="text-bright"
        underlined={viewState === 'json'}
        onClick={() => setViewState('json')}
        className="mx-8"
        heightClassName="pb-2"
      >
        {t('json')}
      </DyoButton>
    </div>
  )

  return (
    <Layout title={t('imagesName', config ?? image)} topBarContent={topBarContent}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <WebSocketSaveIndicator className="mx-3" state={saveState} />

        <DyoButton href={routes.project.versions(project.id).details(version.id, { section: 'images' })}>
          {t('common:back')}
        </DyoButton>

        <DyoButton className="ml-2 px-6" color="bg-error-red" onClick={onDelete}>
          {t('common:delete')}
        </DyoButton>
      </PageHeading>

      <DyoCard className="p-4">
        <div className="flex mb-4 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {image.name}
            {image.name !== config?.name ? ` (${config?.name})` : null}
          </DyoHeading>

          {getViewStateButtons()}
        </div>

        {viewState === 'editor' && <ImageConfigFilters onChange={setFilters} filters={filters} />}
      </DyoCard>

      {viewState === 'editor' && (
        <DyoCard className="flex flex-col mt-4 px-4 w-full">
          <CommonConfigSection
            selectedFilters={filters}
            disabled={!version.mutable}
            config={config}
            onChange={onChange}
            onResetSection={onResetSection}
            editorOptions={editorState}
            fieldErrors={fieldErrors}
            configType="image"
          />

          <CraneConfigSection
            selectedFilters={filters}
            disabled={!version.mutable}
            config={config}
            onChange={onChange}
            onResetSection={onResetSection}
            editorOptions={editorState}
            fieldErrors={fieldErrors}
            configType="image"
          />

          <DagentConfigSection
            selectedFilters={filters}
            disabled={!version.mutable}
            config={config}
            onChange={onChange}
            onResetSection={onResetSection}
            editorOptions={editorState}
            fieldErrors={fieldErrors}
            configType="image"
          />
        </DyoCard>
      )}

      {viewState === 'json' && (
        <DyoCard className="flex flex-col mt-4 p-4 w-full">
          {jsonError ? (
            <DyoMessage message={jsonError} className="text-xs italic w-full mb-2" messageType="error" />
          ) : null}

          <EditImageJson
            config={config}
            editorOptions={editorState}
            onPatch={(it: JsonContainerConfig) => onChange(mergeJsonConfigToImageContainerConfig(config, it))}
            onParseError={err => setJsonError(err?.message)}
            convertConfigToJson={imageConfigToJsonContainerConfig}
          />
        </DyoCard>
      )}

      <DyoConfirmationModal config={deleteModalConfig} className="w-1/4" />
    </Layout>
  )
}

export default ImageDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const routes = TeamRoutes.fromContext(context)

  const projectId = context.query.projectId as string
  const versionId = context.query.versionId as string
  const imageId = context.query.imageId as string

  const project = getCruxFromContext<ProjectDetails>(context, routes.project.api.details(projectId))
  const version = getCruxFromContext<VersionDetails>(context, routes.project.versions(projectId).api.details(versionId))
  const image = getCruxFromContext<VersionImage>(
    context,
    routes.project.versions(projectId).api.imageDetails(versionId, imageId),
  )

  return {
    props: {
      image: await image,
      project: await project,
      version: await version,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
