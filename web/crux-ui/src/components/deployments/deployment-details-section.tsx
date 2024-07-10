import useItemEditorState from '@app/components/editor/use-item-editor-state'
import KeyValueInput from '@app/components/shared/key-value-input'
import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import DyoMultiSelect from '@app/elements/dyo-multi-select'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ConfigBundleOption } from '@app/models'
import { auditToLocaleDate, fetcher } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import useSWR from 'swr'
import DeploymentStatusTag from './deployment-status-tag'
import { DeploymentActions, DeploymentState } from './use-deployment-state'

interface DeploymentDetailsSectionProps {
  className?: string
  state: DeploymentState
  actions: DeploymentActions
}

const ITEM_ID = 'deployment'

const DeploymentDetailsSection = (props: DeploymentDetailsSectionProps) => {
  const { state, actions, className } = props
  const { deployment, mutable, editor, sock } = state

  const { t } = useTranslation('deployments')
  const teamRoutes = useTeamRoutes()

  const editorState = useItemEditorState(editor, sock, ITEM_ID)

  const { data: configBundleOptions } = useSWR<ConfigBundleOption[]>(teamRoutes.configBundle.api.options(), fetcher)

  const configBundlesHref =
    deployment.configBundleIds?.length === 1
      ? teamRoutes.configBundle.details(deployment.configBundleIds[0])
      : teamRoutes.configBundle.list()

  return (
    <DyoCard className={clsx('flex flex-col', className ?? 'p-6')}>
      <div className="flex flex-row justify-between mb-4">
        <DyoLabel>{t('prefixName', { name: deployment.prefix })}</DyoLabel>

        <DeploymentStatusTag className="my-auto" status={deployment.status} />

        <DyoLabel textColor="text-bright" suppressHydrationWarning>
          {auditToLocaleDate(deployment.audit)}
        </DyoLabel>
      </div>

      <DyoLabel className="whitespace-nowrap font-semibold tracking-wide text-bright mb-2">
        {t('configBundle').toUpperCase()}
      </DyoLabel>

      <div className="max-w-lg mb-3 flex flex-row mb-4">
        <DyoMultiSelect
          name="configBundles"
          className="ml-2"
          disabled={!mutable}
          choices={configBundleOptions ?? []}
          idConverter={it => it.id}
          labelConverter={it => it.name}
          selection={deployment.configBundleIds ?? []}
          onSelectionChange={it => actions.onConfigBundlesSelected(it)}
        />

        <DyoLink className="ml-2 my-auto" href={configBundlesHref} qaLabel="config-bundle-view-icon">
          <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
        </DyoLink>
      </div>

      <KeyValueInput
        className="max-h-128 overflow-y-auto"
        disabled={!mutable}
        editorOptions={editorState}
        label={t('images:environment').toUpperCase()}
        items={deployment.environment ?? []}
        onChange={actions.onEnvironmentEdited}
        hint={key =>
          deployment.configBundleEnvironment[key]
            ? t('bundleNameVariableWillBeOverwritten', {
                configBundle: deployment.configBundleEnvironment[key],
              })
            : null
        }
      />
    </DyoCard>
  )
}

export default DeploymentDetailsSection
