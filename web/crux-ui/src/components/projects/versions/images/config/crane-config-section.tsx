import MultiInput from '@app/components/editor/multi-input'
import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoToggle from '@app/elements/dyo-toggle'
import {
  CRANE_CONFIG_FILTER_VALUES,
  CraneConfigProperty,
  ImageConfigProperty,
  filterContains,
  filterEmpty,
} from '@app/models'
import {
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  ContainerConfigData,
  ContainerDeploymentStrategyType,
  CraneConfigDetails,
  InstanceCraneConfigDetails,
  mergeConfigs,
} from '@app/models/container'
import { nullify, toNumber } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { ValidationError } from 'yup'
import ConfigSectionLabel from './config-section-label'
import DyoMessage from '@app/elements/dyo-message'

type CraneConfigSectionBaseProps<T> = {
  config: T
  resetableConfig?: T
  onChange: (config: Partial<T>) => void
  onResetSection: (section: CraneConfigProperty) => void
  selectedFilters: ImageConfigProperty[]
  editorOptions: ItemEditorState
  disabled?: boolean
  fieldErrors: ValidationError[]
}

type ImageCraneConfigSectionProps = CraneConfigSectionBaseProps<CraneConfigDetails> & {
  configType: 'image'
}

type InstanceCraneConfigSectionProps = CraneConfigSectionBaseProps<InstanceCraneConfigDetails> & {
  configType: 'instance'
  imageConfig: ContainerConfigData
}

export type CraneConfigSectionProps = ImageCraneConfigSectionProps | InstanceCraneConfigSectionProps

const CraneConfigSection = (props: CraneConfigSectionProps) => {
  const {
    config: propsConfig,
    resetableConfig: propsResetableConfig,
    configType,
    selectedFilters,
    onChange,
    onResetSection,
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

  return !filterEmpty([...CRANE_CONFIG_FILTER_VALUES], selectedFilters) ? null : (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright uppercase font-semibold tracking-wide bg-dyo-violet/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('base.crane')}
      </DyoHeading>

      <div className="columns-1 lg:columns-2 2xl:columns-3 gap-24 border-2 rounded-lg rounded-tl-[0px] border-solid border-dyo-violet/50 p-8 w-full">
        {/* deploymentStartegy */}
        {filterContains('deploymentStrategy', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <ConfigSectionLabel
              disabled={disabledOnImage || !resetableConfig.deploymentStrategy}
              onResetSection={() => onResetSection('deploymentStrategy')}
            >
              {t('crane.deploymentStrategy').toUpperCase()}
            </ConfigSectionLabel>

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
            <ConfigSectionLabel
              disabled={disabled || !resetableConfig.healthCheckConfig}
              onResetSection={() => onResetSection('healthCheckConfig')}
            >
              {t('crane.healthCheckConfig').toUpperCase()}
            </ConfigSectionLabel>

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
                message={fieldErrors.find(it => it.path?.startsWith('healthCheckConfig.port'))?.message}
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
                message={fieldErrors.find(it => it.path?.startsWith('healthCheckConfig.livenessProbe'))?.message}
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
                message={fieldErrors.find(it => it.path?.startsWith('healthCheckConfig.readinessProbe'))?.message}
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
                message={fieldErrors.find(it => it.path?.startsWith('healthCheckConfig.startupProbe'))?.message}
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
              onResetSection={resetableConfig.customHeaders ? () => onResetSection('customHeaders') : null}
            />
            <DyoMessage
              message={fieldErrors.find(it => it.path?.startsWith('customHeaders'))?.message}
              messageType="error"
            />
          </div>
        )}

        {/* resourceConfig */}
        {filterContains('resourceConfig', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <ConfigSectionLabel
              disabled={disabled || !resetableConfig.resourceConfig}
              onResetSection={() => onResetSection('resourceConfig')}
            >
              {t('crane.resourceConfig').toUpperCase()}
            </ConfigSectionLabel>

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
                message={fieldErrors.find(it => it.path?.startsWith('resourceConfig.limits.cpu'))?.message}
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
                message={fieldErrors.find(it => it.path?.startsWith('resourceConfig.limits.memory'))?.message}
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
                message={fieldErrors.find(it => it.path?.startsWith('resourceConfig.requests.cpu'))?.message}
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
                message={fieldErrors.find(it => it.path?.startsWith('resourceConfig.requests.memory'))?.message}
                disabled={disabled}
              />
            </div>
          </div>
        )}

        {/* proxyHeaders */}
        {filterContains('proxyHeaders', selectedFilters) && (
          <div className="flex flex-row mb-8">
            <ConfigSectionLabel
              disabled={disabledOnImage || resetableConfig.proxyHeaders === null}
              onResetSection={() => onResetSection('proxyHeaders')}
            >
              {t('crane.proxyHeaders').toUpperCase()}
            </ConfigSectionLabel>

            <DyoToggle
              className="ml-2"
              name="proxyHeaders"
              checked={config.proxyHeaders}
              onCheckedChange={it => onChange({ proxyHeaders: it })}
              disabled={disabled}
            />
          </div>
        )}

        {/* LoadBalancer */}
        {filterContains('useLoadBalancer', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <div className="flex flex-row mb-2.5">
              <ConfigSectionLabel
                disabled={disabledOnImage || resetableConfig.useLoadBalancer === null}
                onResetSection={() => onResetSection('useLoadBalancer')}
              >
                {t('crane.useLoadBalancer').toUpperCase()}
              </ConfigSectionLabel>

              <DyoToggle
                className="ml-2"
                name="useLoadBalancer"
                checked={config.useLoadBalancer}
                onCheckedChange={it => onChange({ useLoadBalancer: it })}
                disabled={disabled}
              />
            </div>

            {!config.useLoadBalancer ? null : (
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="ml-2"
                label={t('crane.extraLBAnnotations')}
                items={config.extraLBAnnotations ?? []}
                editorOptions={editorOptions}
                onChange={it => onChange({ extraLBAnnotations: it })}
                onResetSection={resetableConfig.extraLBAnnotations ? () => onResetSection('extraLBAnnotations') : null}
                disabled={disabled}
              />
            )}
          </div>
        )}

        {/* Labels */}
        {filterContains('labels', selectedFilters) && (
          <div className="flex flex-col">
            <ConfigSectionLabel
              disabled={disabled || !resetableConfig.labels}
              onResetSection={() => onResetSection('labels')}
            >
              {t('crane.labels').toUpperCase()}
            </ConfigSectionLabel>

            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="mb-2 ml-2"
                label={t('crane.deployment')}
                onChange={it => onChange({ labels: { ...config.labels, deployment: it } })}
                items={config.labels?.deployment ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
              <DyoMessage
                message={fieldErrors.find(it => it.path?.startsWith('labels.deployment'))?.message}
                messageType="error"
              />
            </div>

            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="mb-2 ml-2"
                label={t('crane.service')}
                onChange={it => onChange({ labels: { ...config.labels, service: it } })}
                items={config.labels?.service ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
              <DyoMessage
                message={fieldErrors.find(it => it.path?.startsWith('labels.service'))?.message}
                messageType="error"
              />
            </div>

            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="mb-2 ml-2"
                label={t('crane.ingress')}
                onChange={it => onChange({ labels: { ...config.labels, ingress: it } })}
                items={config.labels?.ingress ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
              <DyoMessage
                message={fieldErrors.find(it => it.path?.startsWith('labels.ingress'))?.message}
                messageType="error"
              />
            </div>
          </div>
        )}

        {/* Annotations */}
        {filterContains('annotations', selectedFilters) && (
          <div className="flex flex-col">
            <ConfigSectionLabel
              disabled={disabled || !resetableConfig.annotations}
              onResetSection={() => onResetSection('annotations')}
            >
              {t('crane.annotations').toUpperCase()}
            </ConfigSectionLabel>

            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="mb-2 ml-2"
                label={t('crane.deployment')}
                onChange={it => onChange({ annotations: { ...config.annotations, deployment: it } })}
                items={config.annotations?.deployment ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
              <DyoMessage
                message={fieldErrors.find(it => it.path?.startsWith('annotations.deployment'))?.message}
                messageType="error"
              />
            </div>

            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="mb-2 ml-2"
                label={t('crane.service')}
                onChange={it => onChange({ annotations: { ...config.annotations, service: it } })}
                items={config.annotations?.service ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
              <DyoMessage
                message={fieldErrors.find(it => it.path?.startsWith('annotations.service'))?.message}
                messageType="error"
              />
            </div>

            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="mb-2 ml-2"
                label={t('crane.ingress')}
                onChange={it => onChange({ annotations: { ...config.annotations, ingress: it } })}
                items={config.annotations?.ingress ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
              <DyoMessage
                message={fieldErrors.find(it => it.path?.startsWith('annotations.ingress'))?.message}
                messageType="error"
              />
            </div>
          </div>
        )}

        {/* metrics */}
        {filterContains('metrics', selectedFilters) && (
          <div className="grid break-inside-avoid mb-8">
            <ConfigSectionLabel
              disabled={disabledOnImage || resetableConfig.metrics === null}
              onResetSection={() => onResetSection('metrics')}
            >
              {t('crane.metrics').toUpperCase()}
            </ConfigSectionLabel>

            <DyoToggle
              className="ml-2 mb-3"
              name="metrics"
              checked={config.metrics?.enabled ?? false}
              onCheckedChange={it =>
                onChange({
                  metrics: {
                    ...config.metrics,
                    enabled: it,
                  },
                })
              }
              disabled={disabled}
            />

            {config.metrics?.enabled && (
              <>
                <MultiInput
                  id="crane.metrics.path"
                  containerClassName="max-w-lg mb-3"
                  label={t('crane.metricsPath')}
                  labelClassName="text-bright font-semibold tracking-wide mb-2 my-auto mr-4"
                  grow
                  value={config.metrics?.path ?? ''}
                  placeholder={t('crane.placeholders.metricsPath')}
                  onPatch={it => {
                    onChange({
                      metrics: {
                        ...config.metrics,
                        path: it,
                      },
                    })
                  }}
                  editorOptions={editorOptions}
                  message={fieldErrors.find(it => it.path?.startsWith('metrics.path'))?.message}
                  disabled={disabled}
                />

                <MultiInput
                  id="crane.metrics.port"
                  containerClassName="max-w-lg mb-3"
                  label={t('crane.metricsPort')}
                  labelClassName="text-bright font-semibold tracking-wide mb-2 my-auto mr-4"
                  grow
                  value={config.metrics?.port ?? ''}
                  placeholder={t('crane.placeholders.metricsPort')}
                  onPatch={it => {
                    const val = toNumber(it)
                    onChange({
                      metrics: {
                        ...config.metrics,
                        port: val,
                      },
                    })
                  }}
                  editorOptions={editorOptions}
                  message={fieldErrors.find(it => it.path?.startsWith('metrics.port'))?.message}
                  disabled={disabled}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CraneConfigSection
