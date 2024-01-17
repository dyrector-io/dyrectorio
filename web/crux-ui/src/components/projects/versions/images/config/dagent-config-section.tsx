import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import {
  DagentConfigProperty,
  DAGENT_CONFIG_PROPERTIES,
  filterContains,
  filterEmpty,
  ImageConfigProperty,
  ContainerConfigData,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  DagentConfigDetails,
  InstanceDagentConfigDetails,
  mergeConfigs,
} from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import ConfigSectionLabel from './config-section-label'
import DyoMessage from '@app/elements/dyo-message'
import { ContainerConfigValidationErrors, findErrorFor } from '@app/validations'

type DagentConfigSectionBaseProps<T> = {
  config: T
  resetableConfig?: T
  onChange: (config: Partial<T>) => void
  onResetSection: (section: DagentConfigProperty) => void
  selectedFilters: ImageConfigProperty[]
  editorOptions: ItemEditorState
  disabled?: boolean
  fieldErrors: ContainerConfigValidationErrors
}

type ImageDagentConfigSectionProps = DagentConfigSectionBaseProps<DagentConfigDetails> & {
  configType: 'image'
}

type InstanceDagentConfigSectionProps = DagentConfigSectionBaseProps<InstanceDagentConfigDetails> & {
  configType: 'instance'
  imageConfig: ContainerConfigData
}

type DagentConfigSectionProps = ImageDagentConfigSectionProps | InstanceDagentConfigSectionProps

const DagentConfigSection = (props: DagentConfigSectionProps) => {
  const {
    config: propsConfig,
    resetableConfig: propsResetableConfig,
    configType,
    onResetSection,
    selectedFilters,
    onChange,
    editorOptions,
    disabled,
    fieldErrors,
  } = props

  const { t } = useTranslation('container')

  const disabledOnImage = configType === 'image' || disabled
  // eslint-disable-next-line react/destructuring-assignment
  const imageConfig = configType === 'instance' ? props.imageConfig : null
  const resetableConfig = propsResetableConfig ?? propsConfig
  const config = configType === 'instance' ? mergeConfigs(imageConfig, propsConfig) : propsConfig

  return !filterEmpty([...DAGENT_CONFIG_PROPERTIES], selectedFilters) ? null : (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright uppercase font-semibold tracking-wide bg-dyo-sky/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('base.dagent')}
      </DyoHeading>

      <div className="columns-1 lg:columns-2 2xl:columns-3 gap-24 border-2 rounded-lg rounded-tl-[0px] border-solid border-dyo-sky/50 p-8 w-full">
        {/* networkMode */}
        {filterContains('networkMode', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <ConfigSectionLabel
              disabled={disabledOnImage || !resetableConfig.networkMode}
              onResetSection={() => onResetSection('networkMode')}
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
              onResetSection={resetableConfig.networks ? () => onResetSection('networks') : null}
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
              onResetSection={resetableConfig.dockerLabels ? () => onResetSection('dockerLabels') : null}
              items={config.dockerLabels ?? []}
              editorOptions={editorOptions}
              disabled={disabled}
            />
            <DyoMessage message={findErrorFor(fieldErrors, 'dockerLabels')} messageType="error" />
          </div>
        )}

        {/* restartPolicy */}
        {filterContains('restartPolicy', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <ConfigSectionLabel
              disabled={disabledOnImage || !resetableConfig.restartPolicy}
              onResetSection={() => onResetSection('restartPolicy')}
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
              disabled={disabled || !resetableConfig.logConfig}
              onResetSection={() => onResetSection('logConfig')}
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
      </div>
    </div>
  )
}

export default DagentConfigSection
