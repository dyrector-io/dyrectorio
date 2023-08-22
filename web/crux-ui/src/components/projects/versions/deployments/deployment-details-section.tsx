import useItemEditorState from '@app/components/editor/use-item-editor-state'
import KeyValueInput from '@app/components/shared/key-value-input'
import useTranslation from 'next-translate/useTranslation'
import DeploymentDetailsCard from './deployment-details-card'
import { DeploymentActions, DeploymentState } from './use-deployment-state'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useSWR from 'swr'
import { fetcher } from '@app/utils'
import { DyoLabel } from '@app/elements/dyo-label'
import { ConfigBundleOption } from '@app/models/config-bundle'
import DyoMultiSelect from '@app/elements/dyo-multi-select'
import DyoIcon from '@app/elements/dyo-icon'
import Link from 'next/link'

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

  const { data: configBundleOptions } = useSWR<ConfigBundleOption[]>(teamRoutes.configBundles.api.options(), fetcher)

  const configBundlesHres = deployment.configBundleIds?.length === 1
    ? teamRoutes.configBundles.details(deployment.configBundleIds[0])
    : teamRoutes.configBundles.list()

  return (
    <DeploymentDetailsCard className={className} deployment={deployment}>
      <div className="max-w-lg mb-3 flex flex-row mt-2">
        <DyoLabel className="my-auto whitespace-nowrap text-light-eased">{t('configBundle')}</DyoLabel>

        <DyoMultiSelect
          className="ml-2"
          disabled={!mutable}
          choices={configBundleOptions ?? []}
          idConverter={it => it.id}
          labelConverter={it => it.name}
          selection={deployment.configBundleIds ?? []}
          onSelectionChange={it => actions.onConfigBundlesSelected(it)}
        />

        <Link className="ml-2 my-auto" href={configBundlesHres} passHref>
          <DyoIcon src="/eye.svg" alt={t('common:view')} size="md" />
        </Link>
      </div>

      <KeyValueInput
        className="max-h-128 overflow-y-auto"
        disabled={!mutable}
        editorOptions={editorState}
        label={t('images:environment').toUpperCase()}
        items={deployment.environment ?? []}
        onChange={actions.onEnvironmentEdited}
      />
    </DeploymentDetailsCard>
  )
}

export default DeploymentDetailsSection
