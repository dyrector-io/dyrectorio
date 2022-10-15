import { EditorStateOptions } from '@app/components/editor/use-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoSwitch from '@app/elements/dyo-switch'
import { ImageConfigFilterType } from '@app/models'
import {
  ContainerConfig,
  ContainerDeploymentStrategyType,
  CONTAINER_DEPLOYMENT_STRATEGY_VALUES,
  CraneConfigDetails,
} from '@app/models/container'
import { nullify } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

interface CraneConfigSectionProps {
  config: CraneConfigDetails
  onChange: (config: Partial<ContainerConfig>) => void
  filters: ImageConfigFilterType[]
  editorOptions: EditorStateOptions
}

const CraneConfigSection = (props: CraneConfigSectionProps) => {
  const { t } = useTranslation('container')
  const { config: propsConfig, filters, onChange: propsOnChange, editorOptions } = props

  const [config, setConfig] = useState<CraneConfigDetails>(propsConfig)

  const onChange = (newConfig: Partial<ContainerConfig>) => {
    setConfig({ ...config, ...newConfig })
    propsOnChange(newConfig)
  }

  const toNumber = (value: string): number => {
    if (!value) {
      return undefined
    }

    return Number.isNaN(value) ? 0 : Number(value)
  }

  const contains = (filter: ImageConfigFilterType): boolean => filters.indexOf(filter) !== -1

  return (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright uppercase font-semibold tracking-wide bg-violet-400/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('kubernetes')}
      </DyoHeading>
      <div className="columns-1 lg:columns-2 2xl:columns-3 gap-24 border-2 rounded-lg rounded-tl-[0px] border-solid border-violet-400/50 p-8 w-full">
        {/* deploymentStartegy */}
        {contains('deploymentStrategy') && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('kubernetes.deploymentStrategy').toUpperCase()}
            </DyoLabel>
            <DyoChips
              className="ml-2"
              choices={CONTAINER_DEPLOYMENT_STRATEGY_VALUES}
              initialSelection={config.deploymentStrategy}
              converter={(it: ContainerDeploymentStrategyType) => t(`kubernetes.deploymentStrategies.${it}`)}
              onSelectionChange={it => onChange({ deploymentStrategy: it })}
            />
          </div>
        )}

        {/* healthCheckConfig */}
        {contains('healthCheckConfig') && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('kubernetes.healthCheckConfig').toUpperCase()}
            </DyoLabel>
            <div className="ml-2">
              <DyoInput
                label={t('kubernetes.port')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-20"
                grow
                inline
                value={config.healthCheckConfig?.port ?? ''}
                placeholder={t('common.placeholders.port')}
                onChange={it =>
                  onChange({ healthCheckConfig: { ...config.healthCheckConfig, port: toNumber(it.target.value) } })
                }
              />
              <DyoInput
                label={t('kubernetes.livenessProbe')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-60"
                className="w-full"
                grow
                inline
                value={config.healthCheckConfig?.livenessProbe ?? ''}
                placeholder={t('common.placeholders.path')}
                onChange={it =>
                  onChange({ healthCheckConfig: { ...config.healthCheckConfig, livenessProbe: it.target.value } })
                }
              />
              <DyoInput
                label={t('kubernetes.readinessProbe')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-60"
                className="w-full"
                grow
                inline
                value={config.healthCheckConfig?.readinessProbe ?? ''}
                placeholder={t('common.placeholders.path')}
                onChange={it =>
                  onChange({ healthCheckConfig: { ...config.healthCheckConfig, readinessProbe: it.target.value } })
                }
              />
              <DyoInput
                label={t('kubernetes.startupProbe')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-60"
                className="w-full"
                inline
                grow
                value={config.healthCheckConfig?.startupProbe ?? ''}
                placeholder={t('common.placeholders.path')}
                onChange={it =>
                  onChange({ healthCheckConfig: { ...config.healthCheckConfig, startupProbe: it.target.value } })
                }
              />
            </div>
          </div>
        )}

        {/* customHeaders */}
        {contains('customHeaders') && (
          <div className="grid break-inside-avoid mb-8 max-w-lg">
            <KeyOnlyInput
              className="mb-2"
              labelClassName="text-bright font-semibold tracking-wide mb-2"
              label={t('kubernetes.customHeaders').toUpperCase()}
              items={config.customHeaders ?? []}
              keyPlaceholder={t('kubernetes.placeholders.headerName')}
              onChange={it => onChange({ customHeaders: it })}
              editorOptions={editorOptions}
            />
          </div>
        )}

        {/* resourceConfig */}
        {contains('resourceConfig') && (
          <div className="grid break-inside-avoid mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
              {t('kubernetes.resourceConfig').toUpperCase()}
            </DyoLabel>
            <div className="grid ml-2">
              <DyoLabel className="max-w-lg w-full text-right mb-1">{t('kubernetes.limits')}</DyoLabel>
              <DyoInput
                label={t('kubernetes.cpu')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-40"
                className="w-full"
                inline
                grow
                value={config.resourceConfig?.limits?.cpu ?? ''}
                placeholder={t('kubernetes.placeholders.cpuUsageExample')}
                onChange={it =>
                  onChange({
                    resourceConfig: nullify({
                      ...config.resourceConfig,
                      limits: nullify({ ...config.resourceConfig?.limits, cpu: it.target.value }),
                    }),
                  })
                }
              />
              <DyoInput
                label={t('kubernetes.memory')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-40"
                className="w-full"
                inline
                grow
                value={config.resourceConfig?.limits?.memory ?? ''}
                placeholder={t('kubernetes.placeholders.memoryUsageExample')}
                onChange={it =>
                  onChange({
                    resourceConfig: nullify({
                      ...config.resourceConfig,
                      limits: nullify({ ...config.resourceConfig?.limits, memory: it.target.value }),
                    }),
                  })
                }
              />
              <DyoLabel className="max-w-lg w-full text-right mb-1">{t('kubernetes.requests')}</DyoLabel>
              <DyoInput
                label={t('kubernetes.cpu')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-40"
                className="w-full"
                inline
                grow
                value={config.resourceConfig?.requests?.cpu ?? ''}
                placeholder={t('kubernetes.placeholders.cpuUsageExample')}
                onChange={it =>
                  onChange({
                    resourceConfig: nullify({
                      ...config.resourceConfig,
                      requests: nullify({ ...config.resourceConfig?.requests, cpu: it.target.value }),
                    }),
                  })
                }
              />
              <DyoInput
                label={t('kubernetes.memory')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-4 w-40"
                className="w-full"
                inline
                grow
                value={config.resourceConfig?.requests?.memory ?? ''}
                placeholder={t('kubernetes.placeholders.memoryUsageExample')}
                onChange={it =>
                  onChange({
                    resourceConfig: nullify({
                      ...config.resourceConfig,
                      requests: nullify({ ...config.resourceConfig?.requests, memory: it.target.value }),
                    }),
                  })
                }
              />
            </div>
          </div>
        )}

        {/* proxyHeaders */}
        {contains('proxyHeaders') && (
          <div className="flex flex-row mb-8">
            <DyoLabel className="text-bright font-semibold tracking-wide mb-2 mr-4">
              {t('kubernetes.proxyHeaders').toUpperCase()}
            </DyoLabel>
            <DyoSwitch
              fieldName="proxyHeaders"
              checked={config.proxyHeaders}
              onCheckedChange={it => onChange({ proxyHeaders: it })}
            />
          </div>
        )}

        {/* LoadBalancer */}
        {contains('loadBalancer') && (
          <div className="grid break-inside-avoid mb-8">
            <div className="flex flex-row mb-2.5">
              <DyoLabel className="text-bright font-semibold tracking-wide mb-2 mr-4">
                {t('kubernetes.useLoadBalancer').toUpperCase()}
              </DyoLabel>

              <DyoSwitch
                fieldName="useLoadBalancer"
                checked={config.useLoadBalancer}
                onCheckedChange={it => onChange({ useLoadBalancer: it })}
              />
            </div>
            {!config.useLoadBalancer ? null : (
              <div className="flex flex-wrap ml-2">
                <KeyValueInput
                  label={t('kubernetes.extraLBAnnotations')}
                  items={config.extraLBAnnotations ?? []}
                  editorOptions={editorOptions}
                  onChange={it => onChange({ extraLBAnnotations: it })}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CraneConfigSection
