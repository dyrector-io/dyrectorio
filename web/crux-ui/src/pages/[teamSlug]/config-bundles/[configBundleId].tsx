import { ConfigBundlePageMenu } from '@app/components/config-bundles/config-bundle-page-menu'
import { useConfigBundleDetailsState } from '@app/components/config-bundles/use-config-bundle-details-state'
import MultiInput from '@app/components/editor/multi-input'
import MultiTextArea from '@app/components/editor/multi-textarea'
import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import KeyValueInput from '@app/components/shared/key-value-input'
import PageHeading from '@app/components/shared/page-heading'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import WebSocketSaveIndicator from '@app/elements/web-socket-save-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ConfigBundleDetails } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import toast from 'react-hot-toast'

interface ConfigBundleDetailsPageProps {
  configBundle: ConfigBundleDetails
}

const ConfigBundleDetailsPage = (props: ConfigBundleDetailsPageProps) => {
  const { configBundle: propsConfigBundle } = props

  const { t } = useTranslation('config-bundles')
  const routes = useTeamRoutes()

  const onWsError = (error: Error) => {
    // eslint-disable-next-line
    console.error('ws', 'edit-config-bundle', error)
    toast(t('errors:connectionLost'))
  }

  const onApiError = defaultApiErrorHandler(t)

  const [state, actions] = useConfigBundleDetailsState({
    configBundle: propsConfigBundle,
    onWsError,
    onApiError,
  })

  const { configBundle, editing, saveState, editorState, fieldErrors, topBarContent } = state
  const { setEditing, onDelete, onEditEnv, onEditName, onEditDescription } = actions

  const pageLink: BreadcrumbLink = {
    name: t('common:configBundles'),
    url: routes.configBundle.list(),
  }

  return (
    <Layout title={t('configBundleName', configBundle)} topBarContent={topBarContent}>
      <PageHeading
        pageLink={pageLink}
        sublinks={[
          {
            name: configBundle.name,
            url: routes.configBundle.details(configBundle.id),
          },
        ]}
      >
        <WebSocketSaveIndicator className="mx-3" state={saveState} />

        <ConfigBundlePageMenu
          onDelete={onDelete}
          editing={editing}
          setEditing={setEditing}
          deleteModalTitle={t('common:areYouSureDeleteName', { name: configBundle.name })}
          deleteModalDescription={t('common:proceedYouLoseAllDataToName', {
            name: configBundle.name,
          })}
        />
      </PageHeading>

      <DyoCard>
        <DyoHeading element="h4" className="text-lg text-bright">
          {t(editing ? 'common:editName' : 'view', { name: configBundle.name })}
        </DyoHeading>

        <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

        <div className="flex flex-col gap-2">
          {editing && (
            <div className="w-full flex flex-row gap-2">
              <div className="flex-1 flex flex-col gap-2">
                <DyoLabel className="text-bright font-semibold tracking-wide mb-2 mt-8">{t('common:name')}</DyoLabel>

                <MultiInput
                  id="name"
                  name="name"
                  containerClassName="px-2"
                  onPatch={it => onEditName(it)}
                  value={configBundle.name}
                  editorOptions={editorState}
                  message={fieldErrors.find(it => it.path?.startsWith('name'))?.message}
                  required
                  grow
                />
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <DyoLabel className="text-bright font-semibold tracking-wide mb-2 mt-8">
                  {t('common:description')}
                </DyoLabel>

                <MultiTextArea
                  id="description"
                  name="description"
                  onPatch={it => onEditDescription(it)}
                  value={configBundle.description}
                  editorOptions={editorState}
                  message={fieldErrors.find(it => it.path?.startsWith('description'))?.message}
                  required
                  grow
                />
              </div>
            </div>
          )}

          <KeyValueInput
            className="max-h-128 overflow-y-auto mt-8"
            disabled={!editing}
            label={t('environment')}
            items={configBundle.environment ?? []}
            onChange={onEditEnv}
            editorOptions={editorState}
          />
        </div>
      </DyoCard>
    </Layout>
  )
}

export default ConfigBundleDetailsPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const routes = TeamRoutes.fromContext(context)

  const configBundleId = context.query.configBundleId as string

  const configBundle = await getCruxFromContext<ConfigBundleDetails>(
    context,
    routes.configBundle.api.details(configBundleId),
  )

  return {
    props: {
      configBundle,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
