import MultiInput from '@app/components/editor/multi-input'
import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import {
  ConcreteContainerConfigData,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  CONTAINER_STATE_VALUES,
  ContainerConfigData,
  ContainerConfigErrors,
  ContainerConfigKey,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  ContainerState,
  DAGENT_CONFIG_KEYS,
  DagentConfigKey,
  filterContains,
  filterEmpty,
  stringResettable,
} from '@app/models'
import { toNumber } from '@app/utils'
import { ContainerConfigValidationErrors, findErrorFor } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import ConfigSectionLabel from './config-section-label'

type DagentConfigSectionProps = {
  config: ContainerConfigData | ConcreteContainerConfigData
  onChange: (config: ContainerConfigData | ConcreteContainerConfigData) => void
  onResetSection: (section: DagentConfigKey) => void
  selectedFilters: ContainerConfigKey[]
  editorOptions: ItemEditorState
  disabled?: boolean
  fieldErrors: ContainerConfigValidationErrors
  conflictErrors: ContainerConfigErrors
  baseConfig: ContainerConfigData | null
  resettableConfig: ContainerConfigData | ConcreteContainerConfigData
}

const DagentConfigSection = (props: DagentConfigSectionProps) => {
  const {
    config,
    resettableConfig,
    baseConfig,
    onResetSection,
    selectedFilters,
    onChange,
    editorOptions,
    disabled,
    fieldErrors,
    conflictErrors,
  } = props

  const { t } = useTranslation('container')

  return !filterEmpty([...DAGENT_CONFIG_KEYS], selectedFilters) ? null : (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright uppercase font-semibold tracking-wide bg-dyo-sky/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('base.dagent')}
      </DyoHeading>

      <div className="columns-1 lg:columns-2 2xl:columns-3 gap-24 border-2 rounded-lg rounded-tl-[0px] border-solid border-dyo-sky/50 p-8 w-full">
        {/* networkMode */}
        {filterContains('networkMode', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <ConfigSectionLabel
              disabled={!stringResettable(baseConfig?.networkMode, resettableConfig.networkMode)}
              onResetSection={() => onResetSection('networkMode')}
              error={conflictErrors?.networkMode}
            >
              {t('dagent.networkMode').toUpperCase()}
            </ConfigSectionLabel>

            <DyoChips
              className="ml-2"
              name="networkMode"
              choices={CONTAINER_NETWORK_MODE_VALUES}
              selection={config.networkMode}
              converter={(it: ContainerNetworkMode) => t(`dagent.networkModes.${it}`)}
              onSelectionChange={it => onChange({ networkMode: it })}
              disabled={disabled}
              qaLabel={chipsQALabelFromValue}
            />
          </div>
        )}

        {filterContains('networks', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8 max-w-lg">
            <KeyOnlyInput
              className="max-h-128 overflow-y-auto mb-2"
              labelClassName="text-bright font-semibold tracking-wide mb-2"
              label={t('dagent.networks').toUpperCase()}
              items={config.networks ?? []}
              keyPlaceholder={t('dagent.placeholders.network')}
              onChange={it => onChange({ networks: it })}
              onResetSection={resettableConfig.networks ? () => onResetSection('networks') : null}
              unique={false}
              editorOptions={editorOptions}
              disabled={disabled}
            />
            <DyoMessage message={findErrorFor(fieldErrors, 'networks')} messageType="error" />
          </div>
        )}

        {/* dockerLabels */}
        {filterContains('dockerLabels', selectedFilters) && (
          <div className="grid mb-8 break-inside-avoid">
            <KeyValueInput
              className="max-h-128 overflow-y-auto"
              labelClassName="text-bright font-semibold tracking-wide mb-2"
              label={t('dagent.dockerLabels').toUpperCase()}
              onChange={it => onChange({ dockerLabels: it })}
              onResetSection={resettableConfig.dockerLabels ? () => onResetSection('dockerLabels') : null}
              items={config.dockerLabels ?? []}
              editorOptions={editorOptions}
              disabled={disabled}
              errors={conflictErrors?.dockerLabels}
            />
            <DyoMessage message={findErrorFor(fieldErrors, 'dockerLabels')} messageType="error" />
          </div>
        )}

        {/* restartPolicy */}
        {filterContains('restartPolicy', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <ConfigSectionLabel
              disabled={disabled || !stringResettable(baseConfig?.restartPolicy, resettableConfig.restartPolicy)}
              onResetSection={() => onResetSection('restartPolicy')}
              error={conflictErrors?.restartPolicy}
            >
              {t('dagent.restartPolicy').toUpperCase()}
            </ConfigSectionLabel>

            <DyoChips
              className="ml-2"
              name="restartPolicyType"
              choices={CONTAINER_RESTART_POLICY_TYPE_VALUES}
              selection={config.restartPolicy}
              converter={(it: ContainerRestartPolicyType) => t(`dagent.restartPolicies.${it}`)}
              onSelectionChange={it => onChange({ restartPolicy: it })}
              disabled={disabled}
              qaLabel={chipsQALabelFromValue}
            />
          </div>
        )}

        {/* logConfig */}
        {filterContains('logConfig', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <ConfigSectionLabel
              disabled={disabled || !resettableConfig.logConfig}
              onResetSection={() => onResetSection('logConfig')}
              error={conflictErrors?.logConfig}
            >
              {t('dagent.logConfig').toUpperCase()}
            </ConfigSectionLabel>

            <div className="ml-2">
              <DyoLabel className="mr-2 my-auto">{t('dagent.drivers')}</DyoLabel>

              <DyoChips
                className="mb-2 ml-2"
                name="logDriver"
                choices={CONTAINER_LOG_DRIVER_VALUES}
                selection={config.logConfig?.driver ?? 'nodeDefault'}
                converter={(it: ContainerLogDriverType) => t(`dagent.logDrivers.${it}`)}
                onSelectionChange={it => onChange({ logConfig: { ...config.logConfig, driver: it } })}
                disabled={disabled}
                qaLabel={chipsQALabelFromValue}
              />

              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="text-bright"
                label={t('dagent.options')}
                items={config.logConfig?.options ?? []}
                onChange={it => onChange({ logConfig: { ...config.logConfig, options: it } })}
                editorOptions={editorOptions}
                disabled={disabled}
              />
              <DyoMessage message={findErrorFor(fieldErrors, 'logConfig.options')} messageType="error" />
            </div>
          </div>
        )}

        {/* expectedState */}
        {filterContains('expectedState', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <ConfigSectionLabel
              disabled={!resettableConfig?.expectedState}
              onResetSection={() => onResetSection('expectedState')}
              error={conflictErrors?.expectedState}
            >
              {t('dagent.expectedState').toUpperCase()}
            </ConfigSectionLabel>

            <div className="ml-2">
              <DyoChips
                className="ml-2 mb-2"
                name="expectedState"
                choices={CONTAINER_STATE_VALUES}
                selection={config.expectedState?.state ?? 'running'}
                converter={(it: ContainerState) => t(`common:containerStatuses.${it}`)}
                onSelectionChange={it => onChange({ expectedState: { ...config.expectedState, state: it } })}
                disabled={disabled}
                qaLabel={chipsQALabelFromValue}
              />

              {config.expectedState?.state === 'exited' && (
                <MultiInput
                  id="expectedExitCode"
                  label={t('dagent.expectedExitCode')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  className="w-full"
                  grow
                  inline
                  value={config.expectedState.exitCode ?? 0}
                  placeholder={t('dagent.placeholders.expectedExitCode')}
                  onPatch={it => {
                    const val = toNumber(it)
                    onChange({ expectedState: { ...config.expectedState, exitCode: val } })
                  }}
                  editorOptions={editorOptions}
                  message={findErrorFor(fieldErrors, 'expectedState.exitCode')}
                  disabled={disabled}
                />
              )}

              <MultiInput
                id="expectedStateTimeout"
                label={t('dagent.expectedStateTimeout')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-40"
                className="w-full"
                grow
                inline
                value={config.expectedState?.timeout ?? 120}
                placeholder={t('dagent.placeholders.expectedStateTimeout')}
                onPatch={it => {
                  const val = toNumber(it)
                  onChange({ expectedState: { ...config.expectedState, timeout: val } })
                }}
                editorOptions={editorOptions}
                message={findErrorFor(fieldErrors, 'expectedState.timeout')}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DagentConfigSection
