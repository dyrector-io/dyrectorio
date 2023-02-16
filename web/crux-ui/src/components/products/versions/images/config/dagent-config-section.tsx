import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { DAGENT_CONFIG_PROPERTIES, filterContains, filterEmpty, ImageConfigFilterType } from '@app/models'
import {
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  DagentConfigDetails,
  InstanceDagentConfigDetails,
} from '@app/models/container'
import useTranslation from 'next-translate/useTranslation'

type DagentConfigSectionBaseProps<T> = {
  config: T
  onChange: (config: Partial<T>) => void
  selectedFilters: ImageConfigFilterType[]
  editorOptions: ItemEditorState
  disabled?: boolean
}

type ImageDagentConfigSectionProps = DagentConfigSectionBaseProps<DagentConfigDetails> & {
  configType: 'image'
}

type InstanceDagentConfigSectionProps = DagentConfigSectionBaseProps<InstanceDagentConfigDetails> & {
  configType: 'instance'
}

type DagentConfigSectionProps = ImageDagentConfigSectionProps | InstanceDagentConfigSectionProps

const DagentConfigSection = (props: DagentConfigSectionProps) => {
  const { t } = useTranslation('container')
  const { config, selectedFilters, onChange, editorOptions, disabled } = props

  return !filterEmpty([...DAGENT_CONFIG_PROPERTIES], selectedFilters) ? null : (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright uppercase font-semibold tracking-wide bg-dyo-sky/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('base.dagent')}
      </DyoHeading>

      <div className="columns-1 lg:columns-2 2xl:columns-3 gap-24 border-2 rounded-lg rounded-tl-[0px] border-solid border-dyo-sky/50 p-8 w-full">
        {/* networkMode */}
        {filterContains('networkMode', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('dagent.networkMode').toUpperCase()}
            </DyoLabel>

            <DyoChips
              className="ml-2"
              choices={CONTAINER_NETWORK_MODE_VALUES}
              selection={config.networkMode}
              converter={(it: ContainerNetworkMode) => t(`dagent.networkModes.${it}`)}
              onSelectionChange={it => onChange({ networkMode: it })}
              disabled={disabled}
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
              unique={false}
              editorOptions={editorOptions}
              disabled={disabled}
            />
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
              items={config.dockerLabels ?? []}
              editorOptions={editorOptions}
              disabled={disabled}
            />
          </div>
        )}

        {/* restartPolicy */}
        {filterContains('restartPolicy', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('dagent.restartPolicy').toUpperCase()}
            </DyoLabel>

            <DyoChips
              className="ml-2"
              choices={CONTAINER_RESTART_POLICY_TYPE_VALUES}
              selection={config.restartPolicy}
              converter={(it: ContainerRestartPolicyType) => t(`dagent.restartPolicies.${it}`)}
              onSelectionChange={it => onChange({ restartPolicy: it })}
              disabled={disabled}
            />
          </div>
        )}

        {/* logConfig */}
        {filterContains('logConfig', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('dagent.logConfig').toUpperCase()}
            </DyoLabel>

            <div className="ml-2">
              <DyoLabel className="mr-2 my-auto">{t('dagent.drivers')}</DyoLabel>

              <DyoChips
                className="mb-2 ml-2"
                choices={CONTAINER_LOG_DRIVER_VALUES}
                selection={config.logConfig?.driver ?? 'none'}
                converter={(it: ContainerLogDriverType) => t(`dagent.logDrivers.${it}`)}
                onSelectionChange={it => onChange({ logConfig: { ...config.logConfig, driver: it } })}
                disabled={disabled}
              />

              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                label={t('dagent.options')}
                items={config.logConfig?.options ?? []}
                onChange={it => onChange({ logConfig: { ...config.logConfig, options: it } })}
                editorOptions={editorOptions}
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
