import MultiInput from '@app/components/editor/multi-input'
import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoToggle from '@app/elements/dyo-toggle'
import {
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CRANE_CONFIG_FILTER_VALUES,
  ConcreteContainerConfigData,
  ContainerConfigData,
  ContainerConfigErrors,
  ContainerConfigKey,
  ContainerDeploymentStrategyType,
  CraneConfigKey,
  booleanResettable,
  filterContains,
  filterEmpty,
  stringResettable,
} from '@app/models'
import { nullify, toNumber } from '@app/utils'
import { ContainerConfigValidationErrors, findErrorFor } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import ConfigSectionLabel from './config-section-label'

type CraneConfigSectionProps = {
  config: ContainerConfigData | ConcreteContainerConfigData
  onChange: (config: ContainerConfigData | ConcreteContainerConfigData) => void
  onResetSection: (section: CraneConfigKey) => void
  selectedFilters: ContainerConfigKey[]
  editorOptions: ItemEditorState
  disabled?: boolean
  fieldErrors: ContainerConfigValidationErrors
  conflictErrors: ContainerConfigErrors
  baseConfig: ContainerConfigData | null
  resettableConfig: ContainerConfigData | ConcreteContainerConfigData
}

const CraneConfigSection = (props: CraneConfigSectionProps) => {
  const {
    config,
    resettableConfig,
    baseConfig,
    selectedFilters,
    onChange,
    onResetSection,
    editorOptions,
    disabled,
    fieldErrors,
    conflictErrors,
  } = props

  const { t } = useTranslation('container')

  const ports = config.ports?.filter(it => !!it.internal) ?? []

  useEffect(() => {
    if (config.metrics?.enabled && !config.metrics.port && ports.length > 0) {
      onChange({
        metrics: {
          ...config.metrics,
          port: ports[0].internal,
        },
      })
    }
  }, [config])

  return !filterEmpty([...CRANE_CONFIG_FILTER_VALUES], selectedFilters) ? null : (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright uppercase font-semibold tracking-wide bg-dyo-violet/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('base.crane')}
      </DyoHeading>

      <div className="flex flex-col gap-8 border-2 rounded-lg rounded-tl-[0px] border-solid border-dyo-violet/50 p-8 w-full">
        {/* annotations */}
        {filterContains('annotations', selectedFilters) && (
          <div className="flex flex-col">
            <ConfigSectionLabel
              disabled={disabled || !resettableConfig.annotations}
              onResetSection={() => onResetSection('annotations')}
            >
              {t('crane.annotations').toUpperCase()}
            </ConfigSectionLabel>

            <div className="flex flex-col gap-2">
              <div>
                <KeyValueInput
                  labelClassName="ml-2"
                  label={t('crane.deployment')}
                  onChange={it => onChange({ annotations: { ...config.annotations, deployment: it } })}
                  items={config.annotations?.deployment ?? []}
                  editorOptions={editorOptions}
                  disabled={disabled}
                  errors={conflictErrors?.annotations?.deployment}
                />
                <DyoMessage message={findErrorFor(fieldErrors, 'annotations.deployment')} messageType="error" />
              </div>

              <div>
                <KeyValueInput
                  labelClassName="ml-2"
                  label={t('crane.service')}
                  onChange={it => onChange({ annotations: { ...config.annotations, service: it } })}
                  items={config.annotations?.service ?? []}
                  editorOptions={editorOptions}
                  disabled={disabled}
                  errors={conflictErrors?.annotations.service}
                />
                <DyoMessage message={findErrorFor(fieldErrors, 'annotations.service')} messageType="error" />
              </div>

              <div>
                <KeyValueInput
                  labelClassName="ml-2"
                  label={t('crane.ingress')}
                  onChange={it => onChange({ annotations: { ...config.annotations, ingress: it } })}
                  items={config.annotations?.ingress ?? []}
                  editorOptions={editorOptions}
                  disabled={disabled}
                  errors={conflictErrors?.annotations.ingress}
                />
                <DyoMessage message={findErrorFor(fieldErrors, 'annotations.ingress')} messageType="error" />
              </div>
            </div>
          </div>
        )}

        {/* customHeaders */}
        {filterContains('customHeaders', selectedFilters) && (
          <div>
            <KeyOnlyInput
              labelClassName="text-bright font-semibold tracking-wide"
              label={t('crane.customHeaders').toUpperCase()}
              items={config.customHeaders ?? []}
              keyPlaceholder={t('crane.placeholders.headerName')}
              onChange={it => onChange({ customHeaders: it })}
              editorOptions={editorOptions}
              disabled={disabled}
              onResetSection={resettableConfig.customHeaders ? () => onResetSection('customHeaders') : null}
            />
            <DyoMessage grow message={findErrorFor(fieldErrors, 'customHeaders')} messageType="error" />
          </div>
        )}

        {/* deploymentStartegy */}
        {filterContains('deploymentStrategy', selectedFilters) && (
          <div>
            <ConfigSectionLabel
              disabled={!stringResettable(baseConfig?.deploymentStrategy, resettableConfig.deploymentStrategy)}
              onResetSection={() => onResetSection('deploymentStrategy')}
              error={conflictErrors?.deploymentStrategy}
            >
              {t('crane.deploymentStrategy').toUpperCase()}
            </ConfigSectionLabel>

            <DyoChips
              className="ml-2"
              name="deploymentStrategy"
              choices={CONTAINER_DEPLOYMENT_STRATEGY_VALUES}
              selection={config.deploymentStrategy}
              converter={(it: ContainerDeploymentStrategyType) => t(`crane.deploymentStrategies.${it}`)}
              onSelectionChange={it => onChange({ deploymentStrategy: it })}
              disabled={disabled}
              qaLabel={chipsQALabelFromValue}
            />
          </div>
        )}

        {/* healthCheckConfig */}
        {filterContains('healthCheckConfig', selectedFilters) && (
          <div>
            <ConfigSectionLabel
              disabled={disabled || !resettableConfig.healthCheckConfig}
              onResetSection={() => onResetSection('healthCheckConfig')}
              error={conflictErrors?.healthCheckConfig}
            >
              {t('crane.healthCheckConfig').toUpperCase()}
            </ConfigSectionLabel>

            <div className="flex flex-col gap-4 ml-2 mt-2">
              <MultiInput
                id="crane.port"
                label={t('common.port')}
                containerClassName="w-40"
                labelClassName="my-auto mr-4 w-10"
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
                message={findErrorFor(fieldErrors, 'healthCheckConfig.port')}
              />

              <MultiInput
                id="crane.livenessProbe"
                label={t('crane.livenessProbe')}
                labelClassName="my-auto mr-4 w-40"
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
                message={findErrorFor(fieldErrors, 'healthCheckConfig.livenessProbe')}
              />

              <MultiInput
                id="crane.readinessProbe"
                label={t('crane.readinessProbe')}
                labelClassName="my-auto mr-4 w-40"
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
                message={findErrorFor(fieldErrors, 'healthCheckConfig.readinessProbe')}
              />

              <MultiInput
                id="crane.startupProbe"
                label={t('crane.startupProbe')}
                labelClassName="my-auto mr-4 w-40"
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
                message={findErrorFor(fieldErrors, 'healthCheckConfig.startupProbe')}
              />
            </div>
          </div>
        )}

        {/* labels */}
        {filterContains('labels', selectedFilters) && (
          <div className="flex flex-col">
            <ConfigSectionLabel disabled={disabled || !config.labels} onResetSection={() => onResetSection('labels')}>
              {t('crane.labels').toUpperCase()}
            </ConfigSectionLabel>

            <div className="flex flex-col gap-2">
              <div>
                <KeyValueInput
                  labelClassName="ml-2"
                  label={t('crane.deployment')}
                  onChange={it => onChange({ labels: { ...config.labels, deployment: it } })}
                  items={config.labels?.deployment ?? []}
                  editorOptions={editorOptions}
                  disabled={disabled}
                  errors={conflictErrors?.labels?.deployment}
                />
                <DyoMessage message={findErrorFor(fieldErrors, 'labels.deployment')} messageType="error" />
              </div>

              <div>
                <KeyValueInput
                  labelClassName="ml-2"
                  label={t('crane.service')}
                  onChange={it => onChange({ labels: { ...config.labels, service: it } })}
                  items={config.labels?.service ?? []}
                  editorOptions={editorOptions}
                  disabled={disabled}
                  errors={conflictErrors?.labels?.service}
                />
                <DyoMessage message={findErrorFor(fieldErrors, 'labels.service')} messageType="error" />
              </div>

              <div>
                <KeyValueInput
                  labelClassName="ml-2"
                  label={t('crane.ingress')}
                  onChange={it => onChange({ labels: { ...config.labels, ingress: it } })}
                  items={config.labels?.ingress ?? []}
                  editorOptions={editorOptions}
                  disabled={disabled}
                  errors={conflictErrors?.labels?.ingress}
                />
                <DyoMessage message={findErrorFor(fieldErrors, 'labels.ingress')} messageType="error" />
              </div>
            </div>
          </div>
        )}

        {/* metrics */}
        {filterContains('metrics', selectedFilters) && (
          <div className="flex flex-col">
            <div className="flex flex-row">
              <ConfigSectionLabel
                disabled={disabled || !resettableConfig.metrics}
                onResetSection={() => onResetSection('metrics')}
                error={conflictErrors?.metrics}
              >
                {t('crane.metrics').toUpperCase()}
              </ConfigSectionLabel>

              <DyoToggle
                className="ml-2"
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
            </div>

            {config.metrics?.enabled && (
              <div className="flex-col gap-2 ml-2">
                <MultiInput
                  id="crane.metrics.path"
                  label={t('crane.metricsPath')}
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
                  message={findErrorFor(fieldErrors, 'metrics.path')}
                  disabled={disabled}
                />

                <div className="flex flex-col mt-2">
                  <DyoLabel className="whitespace-nowrap text-light-eased my-2">{t('crane.metricsPort')}</DyoLabel>
                  {ports.length < 1 ? (
                    <DyoMessage messageType="info" message={t('common.noInternalPortsDefined')} />
                  ) : (
                    <DyoChips
                      className="w-full ml-2"
                      name="metricsPort"
                      choices={ports.map(it => it.internal)}
                      selection={config.metrics?.port ?? null}
                      converter={(it: number | null) =>
                        config.ports?.find(port => port.internal === it).internal.toString()
                      }
                      onSelectionChange={it =>
                        onChange({
                          metrics: {
                            ...config.metrics,
                            port: it,
                          },
                        })
                      }
                      disabled={disabled}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* proxyHeaders */}
        {filterContains('proxyHeaders', selectedFilters) && (
          <div className="flex flex-row mb-8">
            <ConfigSectionLabel
              disabled={disabled || !booleanResettable(baseConfig?.proxyHeaders, resettableConfig.proxyHeaders)}
              onResetSection={() => onResetSection('proxyHeaders')}
              error={conflictErrors?.proxyHeaders}
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

        {/* resourceConfig */}
        {filterContains('resourceConfig', selectedFilters) && (
          <div>
            <ConfigSectionLabel
              disabled={disabled || !resettableConfig.resourceConfig}
              onResetSection={() => onResetSection('resourceConfig')}
              error={conflictErrors?.resourceConfig}
            >
              {t('crane.resourceConfig').toUpperCase()}
            </ConfigSectionLabel>

            <div className="flex flex-row gap-16 m-2">
              <div className="flex flex-col">
                <DyoLabel className="font-semibold">{t('crane.limits')}</DyoLabel>

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
                  message={findErrorFor(fieldErrors, 'resourceConfig.limits.cpu')}
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
                  message={findErrorFor(fieldErrors, 'resourceConfig.limits.memory')}
                  disabled={disabled}
                />
              </div>

              <div className="flex flex-col">
                <DyoLabel className="font-semibold">{t('crane.requests')}</DyoLabel>

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
                  message={findErrorFor(fieldErrors, 'resourceConfig.requests.cpu')}
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
                  message={findErrorFor(fieldErrors, 'resourceConfig.requests.memory')}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        )}

        {/* LoadBalancer */}
        {filterContains('useLoadBalancer', selectedFilters) && (
          <div>
            <div className="flex flex-row mb-4">
              <ConfigSectionLabel
                disabled={disabled || booleanResettable(baseConfig?.useLoadBalancer, resettableConfig.useLoadBalancer)}
                onResetSection={() => onResetSection('useLoadBalancer')}
                error={conflictErrors?.useLoadBalancer}
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
                onResetSection={resettableConfig.extraLBAnnotations ? () => onResetSection('extraLBAnnotations') : null}
                disabled={disabled}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CraneConfigSection
