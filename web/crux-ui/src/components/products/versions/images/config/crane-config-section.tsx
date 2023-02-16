import MultiInput from '@app/components/editor/multi-input'
import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoSwitch from '@app/elements/dyo-switch'
import { CRANE_CONFIG_PROPERTIES, filterContains, filterEmpty, ImageConfigFilterType } from '@app/models'
import {
  ContainerDeploymentStrategyType,
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CraneConfigDetails,
  InstanceCraneConfigDetails,
} from '@app/models/container'
import { nullify, toNumber } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

type CraneConfigSectionBaseProps<T> = {
  config: T
  onChange: (config: Partial<T>) => void
  selectedFilters: ImageConfigFilterType[]
  editorOptions: ItemEditorState
  disabled?: boolean
}

type ImageCraneConfigSectionProps = CraneConfigSectionBaseProps<CraneConfigDetails> & {
  configType: 'image'
}

type InstanceCraneConfigSectionProps = CraneConfigSectionBaseProps<InstanceCraneConfigDetails> & {
  configType: 'instance'
}

export type CraneConfigSectionProps = ImageCraneConfigSectionProps | InstanceCraneConfigSectionProps

const CraneConfigSection = (props: CraneConfigSectionProps) => {
  const { t } = useTranslation('container')
  const { config, selectedFilters, onChange, editorOptions, disabled } = props

  return !filterEmpty([...CRANE_CONFIG_PROPERTIES], selectedFilters) ? null : (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright uppercase font-semibold tracking-wide bg-dyo-violet/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('base.crane')}
      </DyoHeading>

      <div className="columns-1 lg:columns-2 2xl:columns-3 gap-24 border-2 rounded-lg rounded-tl-[0px] border-solid border-dyo-violet/50 p-8 w-full">
        {/* deploymentStartegy */}
        {filterContains('deploymentStrategy', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('crane.deploymentStrategy').toUpperCase()}
            </DyoLabel>

            <DyoChips
              className="ml-2"
              choices={CONTAINER_DEPLOYMENT_STRATEGY_VALUES}
              selection={config.deploymentStrategy}
              converter={(it: ContainerDeploymentStrategyType) => t(`crane.deploymentStrategies.${it}`)}
              onSelectionChange={it => onChange({ deploymentStrategy: it })}
              disabled={disabled}
            />
          </div>
        )}

        {/* healthCheckConfig */}
        {filterContains('healthCheckConfig', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('crane.healthCheckConfig').toUpperCase()}
            </DyoLabel>

            <div className="ml-2">
              <MultiInput
                id="crane.port"
                label={t('crane.port')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-20"
                grow
                inline
                value={config.healthCheckConfig?.port ?? ''}
                placeholder={t('common.placeholders.port')}
                onPatch={it =>
                  onChange({
                    healthCheckConfig: { ...config.healthCheckConfig, port: toNumber(it) },
                  })
                }
                editorOptions={editorOptions}
                disabled={disabled}
              />

              <MultiInput
                id="crane.livenessProbe"
                label={t('crane.livenessProbe')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-60"
                className="w-full"
                grow
                inline
                value={config.healthCheckConfig?.livenessProbe ?? ''}
                placeholder={t('common.placeholders.path')}
                onPatch={it =>
                  onChange({
                    healthCheckConfig: { ...config.healthCheckConfig, livenessProbe: it },
                  })
                }
                editorOptions={editorOptions}
                disabled={disabled}
              />

              <MultiInput
                id="crane.readinessProbe"
                label={t('crane.readinessProbe')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-60"
                className="w-full"
                grow
                inline
                value={config.healthCheckConfig?.readinessProbe ?? ''}
                placeholder={t('common.placeholders.path')}
                onPatch={it =>
                  onChange({
                    healthCheckConfig: { ...config.healthCheckConfig, readinessProbe: it },
                  })
                }
                editorOptions={editorOptions}
                disabled={disabled}
              />

              <MultiInput
                id="crane.startupProbe"
                label={t('crane.startupProbe')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-60"
                className="w-full"
                inline
                grow
                value={config.healthCheckConfig?.startupProbe ?? ''}
                placeholder={t('common.placeholders.path')}
                onPatch={it =>
                  onChange({
                    healthCheckConfig: { ...config.healthCheckConfig, startupProbe: it },
                  })
                }
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          </div>
        )}

        {/* customHeaders */}
        {filterContains('customHeaders', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8 max-w-lg">
            <KeyOnlyInput
              className="max-h-128 overflow-y-auto mb-2"
              labelClassName="text-bright font-semibold tracking-wide mb-2"
              label={t('crane.customHeaders').toUpperCase()}
              items={config.customHeaders ?? []}
              keyPlaceholder={t('crane.placeholders.headerName')}
              onChange={it => onChange({ customHeaders: it })}
              editorOptions={editorOptions}
              disabled={disabled}
            />
          </div>
        )}

        {/* resourceConfig */}
        {filterContains('resourceConfig', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('crane.resourceConfig').toUpperCase()}
            </DyoLabel>

            <div className="grid ml-2">
              <DyoLabel className="max-w-lg w-full text-right mb-1">{t('crane.limits')}</DyoLabel>

              <MultiInput
                id="crane.limits.cpu"
                label={t('crane.cpu')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-40"
                className="w-full"
                inline
                grow
                value={config.resourceConfig?.limits?.cpu ?? ''}
                placeholder={t('crane.placeholders.cpuUsageExample')}
                onPatch={it =>
                  onChange({
                    resourceConfig: {
                      ...config.resourceConfig,
                      limits: nullify({ ...config.resourceConfig?.limits, cpu: it }),
                    },
                  })
                }
                editorOptions={editorOptions}
                disabled={disabled}
              />

              <MultiInput
                id="crane.limits.memory"
                label={t('crane.memory')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-40"
                className="w-full"
                inline
                grow
                value={config.resourceConfig?.limits?.memory ?? ''}
                placeholder={t('crane.placeholders.memoryUsageExample')}
                onPatch={it =>
                  onChange({
                    resourceConfig: {
                      ...config.resourceConfig,
                      limits: nullify({ ...config.resourceConfig?.limits, memory: it }),
                    },
                  })
                }
                editorOptions={editorOptions}
                disabled={disabled}
              />

              <DyoLabel className="max-w-lg w-full text-right mb-1">{t('crane.requests')}</DyoLabel>

              <MultiInput
                id="crane.requests.cpu"
                label={t('crane.cpu')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-40"
                className="w-full"
                inline
                grow
                value={config.resourceConfig?.requests?.cpu ?? ''}
                placeholder={t('crane.placeholders.cpuUsageExample')}
                onPatch={it =>
                  onChange({
                    resourceConfig: {
                      ...config.resourceConfig,
                      requests: nullify({ ...config.resourceConfig?.requests, cpu: it }),
                    },
                  })
                }
                editorOptions={editorOptions}
                disabled={disabled}
              />

              <MultiInput
                id="crane.requests.memory"
                label={t('crane.memory')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-40"
                className="w-full"
                inline
                grow
                value={config.resourceConfig?.requests?.memory ?? ''}
                placeholder={t('crane.placeholders.memoryUsageExample')}
                onPatch={it =>
                  onChange({
                    resourceConfig: {
                      ...config.resourceConfig,
                      requests: nullify({ ...config.resourceConfig?.requests, memory: it }),
                    },
                  })
                }
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          </div>
        )}

        {/* proxyHeaders */}
        {filterContains('proxyHeaders', selectedFilters) && (
          <div className="flex flex-row mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2 mr-4">
              {t('crane.proxyHeaders').toUpperCase()}
            </DyoLabel>

            <DyoSwitch
              fieldName="proxyHeaders"
              checked={config.proxyHeaders}
              onCheckedChange={it => onChange({ proxyHeaders: it })}
              disabled={disabled}
            />
          </div>
        )}

        {/* LoadBalancer */}
        {filterContains('loadBalancer', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <div className="flex flex-row mb-2.5">
              <DyoLabel className="text-bright font-semibold tracking-wide mb-2 mr-4">
                {t('crane.useLoadBalancer').toUpperCase()}
              </DyoLabel>

              <DyoSwitch
                fieldName="useLoadBalancer"
                checked={config.useLoadBalancer}
                onCheckedChange={it => onChange({ useLoadBalancer: it })}
                disabled={disabled}
              />
            </div>

            {!config.useLoadBalancer ? null : (
              <div className="flex flex-wrap ml-2">
                <KeyValueInput
                  className="max-h-128 overflow-y-auto"
                  label={t('crane.extraLBAnnotations')}
                  items={config.extraLBAnnotations ?? []}
                  editorOptions={editorOptions}
                  onChange={it => onChange({ extraLBAnnotations: it })}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        )}

        {/* Labels */}
        {filterContains('labels', selectedFilters) && (
          <>
            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                label={t('crane.deploymentLabels').toUpperCase()}
                onChange={it => onChange({ labels: { ...config.labels, deployment: it } })}
                items={config.labels?.deployment ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>

            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                label={t('crane.serviceLabels').toUpperCase()}
                onChange={it => onChange({ labels: { ...config.labels, service: it } })}
                items={config.labels?.service ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>

            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                label={t('crane.ingressLabels').toUpperCase()}
                onChange={it => onChange({ labels: { ...config.labels, ingress: it } })}
                items={config.labels?.ingress ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          </>
        )}

        {/* Labels */}
        {filterContains('annotations', selectedFilters) && (
          <>
            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                label={t('crane.deploymentAnnotations').toUpperCase()}
                onChange={it => onChange({ annotations: { ...config.annotations, deployment: it } })}
                items={config.annotations?.deployment ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>

            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                label={t('crane.serviceAnnotations').toUpperCase()}
                onChange={it => onChange({ annotations: { ...config.annotations, service: it } })}
                items={config.annotations?.service ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>

            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                label={t('crane.ingressAnnotations').toUpperCase()}
                onChange={it => onChange({ annotations: { ...config.annotations, ingress: it } })}
                items={config.annotations?.ingress ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CraneConfigSection
