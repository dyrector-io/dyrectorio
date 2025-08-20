import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import DyoMessage from '@app/elements/dyo-message'
import { CONTAINER_PROBE_TYPE_VALUES, ContainerProbeType, HealthCheckProbe } from '@app/models'
import { toNumber } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import MultiInput from '../editor/multi-input'
import { MultiInputEditorOptions } from '../editor/use-multi-input-state'
import KeyOnlyInput from '../shared/key-only-input'
import ConfigSectionLabel from './config-section-label'

type HealthCheckProbeMessages = {
  port?: string
  path?: string
  command?: string
}

type HealthCheckProbeProps = {
  className?: string
  disabled?: boolean
  label: string
  name: string
  probe: HealthCheckProbe | null
  onChange: (probe: HealthCheckProbe) => void
  editorOptions: MultiInputEditorOptions
  messages: HealthCheckProbeMessages
}

const HealthCheckProbeConfig = (props: HealthCheckProbeProps) => {
  const { className, disabled, name, label, probe, onChange, editorOptions, messages } = props

  const { t } = useTranslation('container')

  const onTypeChange = (type: ContainerProbeType) => {
    if (type === 'none') {
      onChange(null)
      return
    }

    if (type === 'exec') {
      onChange({
        type,
        command: [],
      })
      return
    }

    onChange({
      type,
      path: '',
      port: 80,
    })
  }

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <ConfigSectionLabel disabled onResetSection={null} labelClassName="ml-2">
        {label}
      </ConfigSectionLabel>

      <DyoChips
        className="ml-4"
        name={`healthCheckConfig.${name}.type`}
        choices={CONTAINER_PROBE_TYPE_VALUES}
        selection={probe?.type ?? 'none'}
        converter={(it: ContainerProbeType) => t(`crane.probeTypes.${it}`)}
        onSelectionChange={onTypeChange}
        disabled={disabled}
        qaLabel={chipsQALabelFromValue}
      />

      <div className="flex flex-col gap-4 pl-4">
        {!probe ? null : probe.type === 'exec' ? (
          <>
            <KeyOnlyInput
              labelClassName="text-bright"
              label={t('common.commands')}
              items={probe?.command ?? []}
              keyPlaceholder={t('common.command')}
              onChange={it =>
                onChange({
                  ...probe,
                  command: it,
                })
              }
              editorOptions={editorOptions}
              disabled={disabled}
            />

            <DyoMessage grow message={messages.command} messageType="error" />
          </>
        ) : (
          <>
            <MultiInput
              id={`healthCheckConfig.${name}.port`}
              name={`healthCheckConfig.${name}.port`}
              label={t('common.port')}
              containerClassName="w-40"
              labelClassName="my-auto mr-4 w-10 ml-1"
              grow
              inline
              value={probe?.port ?? ''}
              onPatch={it =>
                onChange({
                  ...probe,
                  port: toNumber(it),
                })
              }
              editorOptions={editorOptions}
              disabled={disabled}
              message={messages.port}
            />

            <MultiInput
              id={`healthCheckConfig.${name}.path`}
              name={`healthCheckConfig.${name}.path`}
              label={t(probe?.type === 'http' ? 'common.path' : 'crane.serviceName')}
              grow
              inline
              value={probe?.path ?? ''}
              onPatch={it =>
                onChange({
                  ...probe,
                  path: it,
                })
              }
              editorOptions={editorOptions}
              disabled={disabled}
              message={messages.path}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default HealthCheckProbeConfig
