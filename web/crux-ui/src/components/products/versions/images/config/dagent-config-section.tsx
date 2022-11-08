import { EditorStateOptions } from '@app/components/editor/use-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { ImageConfigFilterType } from '@app/models'
import {
  ContainerConfig,
  ContainerLogDriverType,
  ContainerNetworkMode,
  ContainerRestartPolicyType,
  CONTAINER_LOG_DRIVER_VALUES,
  CONTAINER_NETWORK_MODE_VALUES,
  CONTAINER_RESTART_POLICY_TYPE_VALUES,
  DagentConfigDetails,
} from '@app/models/container'
import { nullify } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface DagentConfigSectionProps {
  config: DagentConfigDetails
  onChange: (config: Partial<ContainerConfig>) => void
  filters: ImageConfigFilterType[]
  editorOptions: EditorStateOptions
}

const DagentConfigSection = (props: DagentConfigSectionProps) => {
  const { t } = useTranslation('container')
  const { config: propsConfig, filters, onChange: propsOnChange, editorOptions } = props

  const [config, setConfig] = useState<DagentConfigDetails>(propsConfig)

  const onChange = (newConfig: Partial<ContainerConfig>) => {
    setConfig({ ...config, ...newConfig })
    propsOnChange(newConfig)
  }

  const contains = (filter: ImageConfigFilterType): boolean => filters.indexOf(filter) !== -1

  return (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright uppercase font-semibold tracking-wide bg-dyo-sky/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('base.dagent')}
      </DyoHeading>
      <div className="columns-1 lg:columns-2 2xl:columns-3 gap-24 border-2 rounded-lg rounded-tl-[0px] border-solid border-dyo-sky/50 p-8 w-full">
        {/* networkMode */}
        {contains('networkMode') && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('dagent.networkMode').toUpperCase()}
            </DyoLabel>
            <DyoChips
              className="ml-2"
              choices={CONTAINER_NETWORK_MODE_VALUES}
              initialSelection={config.networkMode}
              converter={(it: ContainerNetworkMode) => t(`dagent.networkModes.${it}`)}
              onSelectionChange={it => onChange({ networkMode: it })}
            />
          </div>
        )}

        {contains('networks') && (
          <div className="grid break-inside-avoid mb-8 max-w-lg">
            <KeyOnlyInput
              className="mb-2"
              labelClassName="text-bright font-semibold tracking-wide mb-2"
              label={t('dagent.networks').toUpperCase()}
              items={config.networks ?? []}
              keyPlaceholder={t('dagent.placeholders.network')}
              onChange={it => onChange({ networks: it })}
              unique={false}
              editorOptions={editorOptions}
            />
          </div>
        )}

        {/* dockerLabels */}
        {contains('dockerLabels') && (
          <div className="grid mb-8 break-inside-avoid">
            <KeyValueInput
              labelClassName="text-bright font-semibold tracking-wide mb-2"
              label={t('dagent.dockerLabels').toUpperCase()}
              onChange={it => onChange({ dockerLabels: it })}
              items={config.dockerLabels ?? []}
              editorOptions={editorOptions}
            />
          </div>
        )}

        {/* restartPolicy */}
        {contains('restartPolicy') && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('dagent.restartPolicy').toUpperCase()}
            </DyoLabel>
            <DyoChips
              className="ml-2"
              choices={CONTAINER_RESTART_POLICY_TYPE_VALUES}
              initialSelection={config.restartPolicy}
              converter={(it: ContainerRestartPolicyType) => t(`dagent.restartPolicies.${it}`)}
              onSelectionChange={it => onChange({ restartPolicy: it })}
            />
          </div>
        )}

        {/* logConfig */}
        {contains('logConfig') && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('dagent.logConfig').toUpperCase()}
            </DyoLabel>
            <div className="ml-2">
              <DyoLabel className="mr-2 my-auto">{t('dagent.drivers')}</DyoLabel>
              <DyoChips
                className="mb-2 ml-2"
                choices={CONTAINER_LOG_DRIVER_VALUES}
                initialSelection={config.logConfig?.driver ?? 'none'}
                converter={(it: ContainerLogDriverType) => t(`dagent.logDrivers.${it}`)}
                onSelectionChange={it => onChange({ logConfig: nullify({ ...config.logConfig, driver: it }) })}
              />
              <KeyValueInput
                label={t('dagent.options')}
                items={config.logConfig?.options ?? []}
                onChange={it => onChange({ logConfig: nullify({ ...config.logConfig, options: it }) })}
                editorOptions={editorOptions}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DagentConfigSection
