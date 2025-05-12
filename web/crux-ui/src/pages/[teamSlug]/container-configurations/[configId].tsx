import CommonConfigSection from '@app/components/container-configs/common-config-section'
import configToFilters from '@app/components/container-configs/config-to-filters'
import ContainerConfigFilters from '@app/components/container-configs/container-config-filters'
import ContainerConfigJsonEditor from '@app/components/container-configs/container-config-json-editor'
import CraneConfigSection from '@app/components/container-configs/crane-config-section'
import DagentConfigSection from '@app/components/container-configs/dagent-config-section'
import EditorBadge from '@app/components/editor/editor-badge'
import useEditorState from '@app/components/editor/use-editor-state'
import useItemEditorState from '@app/components/editor/use-item-editor-state'
import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { WS_PATCH_DELAY } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoMessage from '@app/elements/dyo-message'
import WebSocketSaveIndicator from '@app/elements/web-socket-save-indicator'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CANCEL_THROTTLE, useThrottling } from '@app/hooks/use-throttleing'
import useWebSocket from '@app/hooks/use-websocket'
import {
  ConcreteContainerConfigData,
  ConfigSecretsMessage,
  ConfigUpdatedMessage,
  ConflictedContainerConfigData,
  conflictsToError,
  ContainerConfigData,
  ContainerConfigDetails,
  ContainerConfigKey,
  ContainerConfigRelations,
  containerConfigToJsonConfig,
  ContainerConfigType,
  containerConfigTypeToSectionType,
  getConflictsForConcreteConfig,
  JsonContainerConfig,
  mergeConfigList,
  mergeConfigsWithConcreteConfig,
  mergeJsonWithContainerConfig,
  PatchConfigMessage,
  secretInfosConcreteConfig,
  ViewState,
  WebSocketSaveState,
  WS_TYPE_CONFIG_SECRETS,
  WS_TYPE_CONFIG_UPDATED,
  WS_TYPE_GET_CONFIG_SECRETS,
  WS_TYPE_PATCH_CONFIG,
  WS_TYPE_PATCH_RECEIVED,
} from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import {
  ContainerConfigValidationErrors,
  getConcreteContainerConfigFieldErrors,
  getContainerConfigFieldErrors,
  jsonErrorOf,
} from '@app/validations'
import { WsMessage } from '@app/websockets/common'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import { Translate } from 'next-translate'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const pageLinkOf = (t: Translate, url: string, type: ContainerConfigType): BreadcrumbLink => {
  switch (type) {
    case 'image':
      return {
        name: t('common:imageConfig'),
        url,
      }
    case 'instance':
      return {
        name: t('common:instanceConfig'),
        url,
      }
    case 'deployment':
      return {
        name: t('common:deploymentConfig'),
        url,
      }
    case 'config-bundle':
      return {
        name: t('common:configBundles'),
        url,
      }
    default:
      return {
        name: t('common:config'),
        url,
      }
  }
}

const sublinksOf = (
  routes: TeamRoutes,
  type: ContainerConfigType,
  relations: ContainerConfigRelations,
): BreadcrumbLink[] => {
  const { project, version, deployment, configBundle } = relations

  switch (type) {
    case 'image':
      return [
        {
          name: project.name,
          url: routes.project.details(project.id),
        },
        {
          name: version.name,
          url: routes.project.versions(project.id).details(version.id),
        },
      ]
    case 'instance':
    case 'deployment':
      return [
        {
          name: deployment.prefix,
          url: routes.deployment.details(deployment.id),
        },
      ]
    case 'config-bundle':
      return [
        {
          name: configBundle.name,
          url: routes.configBundle.details(configBundle.id),
        },
      ]
    default:
      return []
  }
}

const getConfigErrors = (
  config: ContainerConfigDetails,
  imageLabels: Record<string, string>,
  t: Translate,
): ContainerConfigValidationErrors => {
  const type = containerConfigTypeToSectionType(config.type)

  if (type === 'concrete') {
    return getConcreteContainerConfigFieldErrors(config as ConcreteContainerConfigData, imageLabels, t)
  }

  return getContainerConfigFieldErrors(config, imageLabels, t)
}

const getBaseConfig = (config: ContainerConfigDetails, relations: ContainerConfigRelations): ContainerConfigData => {
  switch (config.type) {
    case 'instance':
      return relations.image.config
    case 'deployment':
      return mergeConfigList(relations.deployment.configBundles.map(it => it.config))
    default:
      return null
  }
}

const getBundlesNameMap = (
  config: ContainerConfigDetails,
  relations: ContainerConfigRelations,
): Record<string, string> => {
  if (config.type !== 'deployment') {
    return {}
  }

  return Object.fromEntries(relations.deployment.configBundles.map(it => [it.config.id, it.name]))
}

const getMergedConfig = (
  config: ContainerConfigDetails,
  relations: ContainerConfigRelations,
): ContainerConfigDetails => {
  const baseConfig = getBaseConfig(config, relations)
  if (!baseConfig) {
    return config
  }

  const concreteConfig = mergeConfigsWithConcreteConfig([baseConfig], config as ConcreteContainerConfigData)
  return {
    ...config,
    ...concreteConfig,
  }
}

const getImageLabels = (
  config: ContainerConfigDetails,
  relations: ContainerConfigRelations,
): Record<string, string> => {
  switch (config.type) {
    case 'image':
    case 'instance':
      return relations.image.labels
    default:
      return {}
  }
}

const getConflicts = (
  config: ContainerConfigDetails,
  relations: ContainerConfigRelations,
): ConflictedContainerConfigData => {
  if (config.type !== 'deployment') {
    return null
  }

  const bundles = relations.deployment.configBundles

  if (bundles.length < 2) {
    return null
  }

  return getConflictsForConcreteConfig(
    bundles.map(it => it.config),
    config as ConcreteContainerConfigData,
  )
}

type ContainerConfigPageProps = {
  config: ContainerConfigDetails
  relations: ContainerConfigRelations
}

const ContainerConfigPage = (props: ContainerConfigPageProps) => {
  const { config: propsConfig, relations } = props

  const { t } = useTranslation('container')
  const routes = useTeamRoutes()

  const [resettableConfig, setResettableConfig] = useState<ContainerConfigDetails>(propsConfig)
  const [viewState, setViewState] = useState<ViewState>('editor')
  const [fieldErrors, setFieldErrors] = useState<ContainerConfigValidationErrors>(() =>
    getConfigErrors(getMergedConfig(propsConfig, relations), getImageLabels(propsConfig, relations), t),
  )
  const [jsonError, setJsonError] = useState(jsonErrorOf(fieldErrors))
  const [topBarContent, setTopBarContent] = useState<React.ReactNode>(null)
  const [saveState, setSaveState] = useState<WebSocketSaveState>(null)

  const [filters, setFilters] = useState<ContainerConfigKey[]>(configToFilters([], resettableConfig, fieldErrors))
  const [secrets, setSecrets] = useState<ConfigSecretsMessage>(null)

  const patch = useRef<Partial<ContainerConfigData>>({})
  const throttle = useThrottling(WS_PATCH_DELAY)
  const sock = useWebSocket(routes.containerConfig.detailsSocket(resettableConfig.id), {
    onOpen: () => {
      setSaveState('connected')
      sock.send(WS_TYPE_GET_CONFIG_SECRETS, {})
    },
    onClose: () => setSaveState('disconnected'),
    onSend: (message: WsMessage) => {
      if (message.type === WS_TYPE_PATCH_CONFIG) {
        setSaveState('saving')
      }
    },
    onReceive: (message: WsMessage) => {
      if (message.type === WS_TYPE_PATCH_RECEIVED) {
        setSaveState('saved')
      }
    },
  })

  const editor = useEditorState(sock)
  const editorState = useItemEditorState(editor, sock, resettableConfig.id)

  const conflicts = getConflicts(resettableConfig, relations)
  const conflictErrors = conflictsToError(t, getBundlesNameMap(resettableConfig, relations), conflicts)
  const baseConfig = getBaseConfig(resettableConfig, relations)
  const config = getMergedConfig(resettableConfig, relations)

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

  const secretInfos = useMemo(
    () => secretInfosConcreteConfig(relations, resettableConfig, secrets?.keys),
    [relations, resettableConfig, secrets],
  )

  const getName = useCallback(() => {
    const parentName = config.parent.name

    switch (config.type) {
      case 'image':
      case 'instance': {
        const name = config.name ?? parentName
        if (!config.name || config.name === parentName) {
          return name
        }

        return `${name} (${parentName})`
      }
      default:
        return parentName
    }
  }, [config.name, config.parent.name, config.type])

  const getBackHref = useCallback(() => {
    switch (propsConfig.type) {
      case 'image':
        return routes.project.versions(relations.project.id).details(relations.version.id, { section: 'images' })
      case 'instance':
      case 'deployment':
        return routes.deployment.details(relations.deployment.id)
      case 'config-bundle':
        return routes.configBundle.details(relations.configBundle.id)
      default:
        throw new Error(`Unknown ContainerConfigType ${propsConfig.type}`)
    }
  }, [routes, relations, propsConfig.type])

  useEffect(() => {
    setFilters(current => configToFilters(current, config))
  }, [config])

  const setErrorsForConfig = (newConfig: ContainerConfigDetails) => {
    const errors = getConfigErrors(newConfig, getImageLabels(propsConfig, relations), t)
    setFieldErrors(errors)
    setJsonError(jsonErrorOf(errors))
  }

  const onChange = (newConfig: ContainerConfigData) => {
    setSaveState('saving')

    const value = { ...resettableConfig, ...newConfig }
    setResettableConfig(value)
    setErrorsForConfig(value)

    const newPatch = {
      ...patch.current,
      ...newConfig,
    }
    patch.current = newPatch

    throttle(() => {
      sock.send(WS_TYPE_PATCH_CONFIG, {
        id: resettableConfig.id,
        config: patch.current,
      } as PatchConfigMessage)

      patch.current = {}
    })
  }

  const onResetSection = (section: ContainerConfigKey) => {
    const newConfig = { ...resettableConfig } as any
    newConfig[section] = section === 'user' ? -1 : null

    setResettableConfig(newConfig)
    setErrorsForConfig(newConfig)

    throttle(CANCEL_THROTTLE)
    sock.send(WS_TYPE_PATCH_CONFIG, {
      id: resettableConfig.id,
      resetSection: section,
    } as PatchConfigMessage)
  }

  sock.on(WS_TYPE_CONFIG_UPDATED, (message: ConfigUpdatedMessage) => {
    if (message.id !== resettableConfig.id) {
      return
    }

    const newConfig = {
      ...resettableConfig,
      ...message,
    }

    setResettableConfig(newConfig)
    setErrorsForConfig(newConfig)
  })

  sock.on(WS_TYPE_CONFIG_SECRETS, setSecrets)

  const pageLink = pageLinkOf(t, routes.configBundle.details(propsConfig.id), propsConfig.type)
  const sublinks = sublinksOf(routes, propsConfig.type, relations)

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

  const { mutable } = config.parent

  const sectionType = containerConfigTypeToSectionType(config.type)
  const showCraneConfig = sectionType === 'base' || relations.deployment?.node?.type === 'k8s'
  const showDagentConfig = sectionType === 'base' || relations.deployment?.node?.type === 'docker'

  return (
    <Layout title={t('containerConfigName', config.name ? config : config.parent)} topBarContent={topBarContent}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <WebSocketSaveIndicator className="mx-3" state={saveState} />

        <DyoButton href={getBackHref()}>{t('common:back')}</DyoButton>
      </PageHeading>

      <DyoCard className="p-4">
        <div className="flex mb-1 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {getName()}
          </DyoHeading>

          {getViewStateButtons()}
        </div>

        <DyoMessage className="text-xs mt-2 mb-4" message={t('templateTips')} messageType="info" />

        {viewState === 'editor' && <ContainerConfigFilters onChange={setFilters} filters={filters} />}
      </DyoCard>

      {viewState === 'editor' && (
        <DyoCard className="flex flex-col mt-4 px-4 w-full">
          <CommonConfigSection
            selectedFilters={filters}
            disabled={!mutable}
            publicKey={secrets?.publicKey ?? relations.deployment?.publicKey}
            secretInfos={secretInfos}
            configType={config.type}
            config={config}
            resettableConfig={resettableConfig}
            baseConfig={baseConfig}
            onChange={onChange}
            onResetSection={onResetSection}
            editorOptions={editorState}
            fieldErrors={fieldErrors}
            conflictErrors={conflictErrors}
          />

          {showCraneConfig && (
            <CraneConfigSection
              selectedFilters={filters}
              disabled={!mutable}
              config={config}
              resettableConfig={resettableConfig}
              baseConfig={baseConfig}
              onChange={onChange}
              onResetSection={onResetSection}
              editorOptions={editorState}
              fieldErrors={fieldErrors}
              conflictErrors={conflictErrors}
            />
          )}

          {showDagentConfig && (
            <DagentConfigSection
              selectedFilters={filters}
              disabled={!mutable}
              config={config}
              resettableConfig={resettableConfig}
              baseConfig={baseConfig}
              onChange={onChange}
              onResetSection={onResetSection}
              editorOptions={editorState}
              fieldErrors={fieldErrors}
              conflictErrors={conflictErrors}
            />
          )}
        </DyoCard>
      )}

      {viewState === 'json' && (
        <DyoCard className="flex flex-col mt-4 p-4 w-full">
          {jsonError ? (
            <DyoMessage message={jsonError} className="text-xs italic w-full mb-2" messageType="error" />
          ) : null}

          <ContainerConfigJsonEditor
            config={config}
            editorOptions={editorState}
            onPatch={(it: JsonContainerConfig) => onChange(mergeJsonWithContainerConfig(config, it))}
            onParseError={err => setJsonError(err?.message)}
            convertConfigToJson={containerConfigToJsonConfig}
          />
        </DyoCard>
      )}
    </Layout>
  )
}

export default ContainerConfigPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const configId = context.query.configId as string

  const config = await getCruxFromContext<ContainerConfigDetails>(context, routes.containerConfig.api.details(configId))
  const relations = await getCruxFromContext<ContainerConfigRelations>(
    context,
    routes.containerConfig.api.relations(configId),
  )

  return {
    props: {
      config,
      relations,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
