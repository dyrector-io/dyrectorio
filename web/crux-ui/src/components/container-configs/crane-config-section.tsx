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
  numberResettable,
  stringResettable,
} from '@app/models'
import { nullify, toNumber } from '@app/utils'
import { ContainerConfigValidationErrors, findErrorFor } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import ConfigSectionLabel from './config-section-label'
import HealthCheckProbeConfig from './health-check-probe-config'

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

        {/* corsHeaders */}
        {filterContains('corsHeaders', selectedFilters) && (
          <div>
            <KeyOnlyInput
              labelClassName="text-bright font-semibold tracking-wide"
              label={t('crane.corsHeaders').toUpperCase()}
              items={config.corsHeaders ?? []}
              keyPlaceholder={t('crane.placeholders.headerName')}
              onChange={it => onChange({ corsHeaders: it })}
              editorOptions={editorOptions}
              disabled={disabled}
              onResetSection={resettableConfig.corsHeaders ? () => onResetSection('corsHeaders') : null}
            />
            <DyoMessage grow message={findErrorFor(fieldErrors, 'corsHeaders')} messageType="error" />
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

            <div className="flex flex-col gap-4">
              <HealthCheckProbeConfig
                className="mt-2"
                disabled={disabled}
                label={t('crane.livenessProbe')}
                name="crane.livenessProbe"
                probe={config.healthCheckConfig?.liveness}
                onChange={it =>
                  onChange({
                    healthCheckConfig: {
                      ...config.healthCheckConfig,
                      liveness: it,
                    },
                  })
                }
                editorOptions={editorOptions}
                messages={{
                  port: findErrorFor(fieldErrors, 'healthCheckConfig.liveness.port'),
                  path: findErrorFor(fieldErrors, 'healthCheckConfig.liveness.path'),
                  command: findErrorFor(fieldErrors, 'healthCheckConfig.liveness.command'),
                }}
              />

              <HealthCheckProbeConfig
                disabled={disabled}
                label={t('crane.readinessProbe')}
                name="crane.readinessProbe"
                probe={config.healthCheckConfig?.readiness}
                onChange={it =>
                  onChange({
                    healthCheckConfig: {
                      ...config.healthCheckConfig,
                      readiness: it,
                    },
                  })
                }
                editorOptions={editorOptions}
                messages={{
                  port: findErrorFor(fieldErrors, 'healthCheckConfig.readiness.port'),
                  path: findErrorFor(fieldErrors, 'healthCheckConfig.readiness.path'),
                  command: findErrorFor(fieldErrors, 'healthCheckConfig.readiness.command'),
                }}
              />

              <HealthCheckProbeConfig
                disabled={disabled}
                label={t('crane.startupProbe')}
                name="crane.startupProbe"
                probe={config.healthCheckConfig?.startup}
                onChange={it =>
                  onChange({
                    healthCheckConfig: {
                      ...config.healthCheckConfig,
                      startup: it,
                    },
                  })
                }
                editorOptions={editorOptions}
                messages={{
                  port: findErrorFor(fieldErrors, 'healthCheckConfig.startup.port'),
                  path: findErrorFor(fieldErrors, 'healthCheckConfig.startup.path'),
                  command: findErrorFor(fieldErrors, 'healthCheckConfig.startup.command'),
                }}
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

        {/* proxyBuffering */}
        {filterContains('proxyBuffering', selectedFilters) && (
          <div className="flex flex-row mb-8">
            <ConfigSectionLabel
              disabled={disabled || !booleanResettable(baseConfig?.proxyBuffering, resettableConfig.proxyBuffering)}
              onResetSection={() => onResetSection('proxyBuffering')}
              error={conflictErrors?.proxyBuffering}
            >
              {t('crane.proxyBuffering').toUpperCase()}
            </ConfigSectionLabel>

            <DyoToggle
              className="ml-2"
              name="proxyBuffering"
              checked={config.proxyBuffering}
              onCheckedChange={it => onChange({ proxyBuffering: it })}
              disabled={disabled}
            />
          </div>
        )}

        {/* proxyHeaders */}
        {filterContains('proxyHeaders', selectedFilters) && (
          <div>
            <KeyOnlyInput
              labelClassName="text-bright font-semibold tracking-wide"
              label={t('crane.proxyHeaders').toUpperCase()}
              items={config.proxyHeaders ?? []}
              keyPlaceholder={t('crane.placeholders.headerName')}
              onChange={it => onChange({ proxyHeaders: it })}
              editorOptions={editorOptions}
              disabled={disabled}
              onResetSection={resettableConfig.proxyHeaders ? () => onResetSection('proxyHeaders') : null}
            />
            <DyoMessage grow message={findErrorFor(fieldErrors, 'proxyHeaders')} messageType="error" />
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

        {/* user */}
        {filterContains('replicas', selectedFilters) && (
          <div className="flex flex-row gap-4 items-start">
            <ConfigSectionLabel
              className="mt-2.5"
              disabled={disabled || !numberResettable(baseConfig?.replicas, resettableConfig.replicas)}
              onResetSection={() => onResetSection('replicas')}
            >
              {t('crane.replicas').toUpperCase()}
            </ConfigSectionLabel>

            <MultiInput
              id="crane.replicas"
              labelClassName="text-bright font-semibold tracking-wide mr-4"
              value={config.replicas !== -1 ? config.replicas : ''}
              onPatch={it => {
                const val = toNumber(it)
                onChange({ replicas: typeof val !== 'number' ? -1 : val })
              }}
              editorOptions={editorOptions}
              message={findErrorFor(fieldErrors, 'user') ?? conflictErrors?.user}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default CraneConfigSection
