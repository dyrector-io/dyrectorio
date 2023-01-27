import { EditorStateOptions } from '@app/components/editor/use-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import SecretKeyInput from '@app/components/shared/secret-key-input'
import SecretKeyValInput from '@app/components/shared/secret-key-value-input'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoImgButton from '@app/elements/dyo-img-button'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoSwitch from '@app/elements/dyo-switch'
import { COMMON_CONFIG_FILTERS, filterContains, filterEmpty, ImageConfigFilterType } from '@app/models'
import {
  CommonConfigDetails,
  ContainerConfig,
  ContainerConfigExposeStrategy,
  ContainerConfigVolume,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  InitContainer,
  InitContainerVolumeLink,
  PortRange,
  VolumeType,
} from '@app/models/container'
import { nullify, toNumber } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { ValidationError } from 'yup'

interface CommonConfigSectionProps {
  disabled?: boolean
  config: CommonConfigDetails
  onChange: (config: Partial<ContainerConfig>) => void
  selectedFilters: ImageConfigFilterType[]
  editorOptions: EditorStateOptions
  fieldErrors: ValidationError[]
  secrets?: 'key' | 'value'
  definedSecrets?: string[]
  publicKey?: string
}

const CommonConfigSection = (props: CommonConfigSectionProps) => {
  const { t } = useTranslation('container')
  const {
    disabled,
    config: propsConfig,
    onChange: propsOnChange,
    selectedFilters,
    editorOptions,
    fieldErrors,
    secrets,
    definedSecrets,
    publicKey,
  } = props

  const [config, setConfig] = useState<CommonConfigDetails>(propsConfig)

  const onChange = (newConfig: Partial<ContainerConfig>) => {
    setConfig({ ...config, ...newConfig })
    propsOnChange(newConfig)
  }

  const onComplexValueChange = <T,>(property: string, field: string, value: T, index: number) => {
    const newValue = {
      ...config[property][index],
      [field]: value,
    }

    const updatedIndex = config[property].map(it => it.id).indexOf(newValue.id)
    const list = [...config[property]]
    list[updatedIndex] = nullify(newValue)

    onChange({ [property]: list })
  }

  return !filterEmpty([...COMMON_CONFIG_FILTERS], selectedFilters) ? null : (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright font-semibold tracking-wide bg-dyo-orange/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('base.common').toUpperCase()}
      </DyoHeading>
      <div className="flex flex-col border-2 rounded-lg rounded-tl-[0px] border-solid border-dyo-orange/50 p-8 w-full">
        <div className="columns-1 lg:columns-2 2xl:columns-3 gap-x-20">
          {/* name */}
          {filterContains('name', selectedFilters) && (
            <div className="grid break-inside-avoid mb-4">
              <DyoInput
                label={t('common.containerName').toUpperCase()}
                containerClassName="max-w-lg mb-3"
                labelClassName="text-bright font-semibold tracking-wide mb-2 my-auto mr-4"
                grow
                inline
                value={config.name ?? ''}
                placeholder={t('common.containerName')}
                onChange={it => onChange({ name: it.target.value })}
                message={fieldErrors.find(it => it.path?.startsWith('name'))?.message}
                disabled={disabled}
              />
            </div>
          )}

          {/* user */}
          {filterContains('user', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8">
              <DyoInput
                label={t('common.user').toUpperCase()}
                containerClassName="max-w-lg mb-3"
                labelClassName="text-bright font-semibold tracking-wide mb-2 my-auto mr-4"
                grow
                inline
                value={config.user ?? ''}
                placeholder={t('common.placeholders.userIdNumber')}
                onChange={it => onChange({ user: toNumber(it.target.value) })}
                disabled={disabled}
              />
            </div>
          )}

          {/* expose */}
          {filterContains('expose', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8">
              <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
                {t('common.exposeStrategy').toUpperCase()}
              </DyoLabel>
              <DyoChips
                className="ml-2"
                choices={CONTAINER_EXPOSE_STRATEGY_VALUES}
                initialSelection={config.expose}
                converter={(it: ContainerConfigExposeStrategy) => t(`common.exposeStrategies.${it}`)}
                onSelectionChange={it => onChange({ expose: it })}
                disabled={disabled}
              />
            </div>
          )}

          {/* tty */}
          {filterContains('tty', selectedFilters) && (
            <div className="flex flex-row break-inside-avoid mb-8">
              <DyoLabel className="text-bright font-semibold tracking-wide mb-2 mr-2">
                {t('common.tty').toUpperCase()}
              </DyoLabel>
              <DyoSwitch
                fieldName="tty"
                checked={config.tty}
                disabled={disabled}
                onCheckedChange={it => onChange({ tty: it })}
              />
            </div>
          )}

          {/* configContainer */}
          {filterContains('configContainer', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8">
              <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
                {t('common.configContainer').toUpperCase()}
              </DyoLabel>
              <div className="ml-2">
                <DyoInput
                  label={t('common.image')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.configContainer?.image ?? ''}
                  onChange={it =>
                    onChange({ configContainer: nullify({ ...config.configContainer, image: it.target.value }) })
                  }
                  message={fieldErrors.find(it => it.path?.startsWith('configContainer.image'))?.message}
                  disabled={disabled}
                />
                <DyoInput
                  label={t('common.volume')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.configContainer?.volume ?? ''}
                  onChange={it =>
                    onChange({ configContainer: nullify({ ...config.configContainer, volume: it.target.value }) })
                  }
                  message={fieldErrors.find(it => it.path?.startsWith('configContainer.volume'))?.message}
                  disabled={disabled}
                />
                <DyoInput
                  label={t('common.path')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.configContainer?.path ?? ''}
                  onChange={it =>
                    onChange({ configContainer: nullify({ ...config.configContainer, path: it.target.value }) })
                  }
                  message={fieldErrors.find(it => it.path?.startsWith('configContainer.path'))?.message}
                  disabled={disabled}
                />
                <div className="flex flex-row break-inside-avoid mb-8">
                  <DyoLabel className="my-auto mr-12">{t('common.keepFiles')}</DyoLabel>
                  <DyoSwitch
                    fieldName="configContainer.keepFiles"
                    checked={config.configContainer?.keepFiles}
                    onCheckedChange={it =>
                      onChange({ configContainer: nullify({ ...config.configContainer, keepFiles: it }) })
                    }
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ingress */}
          {filterContains('ingress', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8">
              <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
                {t('common.ingress').toUpperCase()}
              </DyoLabel>
              <div className="ml-2">
                <DyoInput
                  label={t('common.ingressName')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.ingress?.name ?? ''}
                  placeholder={t('common.placeholders.ingressName')}
                  onChange={it => onChange({ ingress: nullify({ ...config.ingress, name: it.target.value }) })}
                  message={fieldErrors.find(it => it.path?.startsWith('ingress.name'))?.message}
                  disabled={disabled}
                />
                <DyoInput
                  label={t('common.ingressHost')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.ingress?.host ?? ''}
                  placeholder={t('common.placeholders.ingressHost')}
                  onChange={it => onChange({ ingress: nullify({ ...config.ingress, host: it.target.value }) })}
                  message={fieldErrors.find(it => it.path?.startsWith('ingress.host'))?.message}
                  disabled={disabled}
                />
                <DyoInput
                  label={t('common.ingressUploadLimit')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.ingress?.uploadLimitInBytes ?? ''}
                  placeholder={t('common.placeholders.ingressUploadLimit')}
                  onChange={it =>
                    onChange({ ingress: nullify({ ...config.ingress, uploadLimitInBytes: it.target.value }) })
                  }
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {/* environment */}
          {filterContains('environment', selectedFilters) && (
            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                label={t('common.environment').toUpperCase()}
                onChange={it => onChange({ environment: it })}
                items={config.environment ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          )}

          {/* capabilities */}
          {filterContains('capabilities', selectedFilters) && (
            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                label={t('common.capabilities').toUpperCase()}
                onChange={it => onChange({ capabilities: it })}
                items={config.capabilities ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          )}

          {/* secrets */}
          {filterContains('secrets', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8 max-w-lg">
              {secrets === 'value' ? (
                <SecretKeyValInput
                  className="mb-2"
                  keyPlaceholder={t('common.secrets').toUpperCase()}
                  labelClassName="text-bright font-semibold tracking-wide mb-2"
                  label={t('common.secrets').toUpperCase()}
                  onSubmit={it => onChange({ secrets: it })}
                  items={config.secrets ?? []}
                  editorOptions={editorOptions}
                  definedSecrets={definedSecrets}
                  publicKey={publicKey}
                  unique
                  disabled={disabled}
                />
              ) : (
                <SecretKeyInput
                  className="mb-2"
                  keyPlaceholder={t('common.secrets').toUpperCase()}
                  labelClassName="text-bright font-semibold tracking-wide mb-2"
                  label={t('common.secrets').toUpperCase()}
                  onChange={it => onChange({ secrets: it.map(sit => ({ ...sit, value: '', publicKey: '' })) })}
                  items={config.secrets ?? []}
                  editorOptions={editorOptions}
                  unique
                  disabled={disabled}
                />
              )}
            </div>
          )}

          {/* args */}
          {filterContains('args', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8 max-w-lg">
              <KeyOnlyInput
                className="mb-2"
                keyPlaceholder={t('common.arguments')}
                label={t('common.args').toUpperCase()}
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                onChange={it => onChange({ args: it })}
                items={config.args}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          )}

          {/* commands */}
          {filterContains('commands', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8 max-w-lg">
              <KeyOnlyInput
                className="mb-2"
                keyPlaceholder={t('common.commands')}
                label={t('common.commands').toUpperCase()}
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                onChange={it => onChange({ commands: it })}
                items={config.commands ?? []}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          )}

          {/* importContainer */}
          {filterContains('importContainer', selectedFilters) && (
            <div className="grid mb-8 break-inside-avoid">
              <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
                {t('common.importContainer').toUpperCase()}
              </DyoLabel>
              <div className="ml-2">
                <DyoInput
                  label={t('common.volume')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-2 w-40"
                  className="w-full"
                  grow
                  inline
                  value={config.importContainer?.volume ?? ''}
                  placeholder={t('common.volume')}
                  onChange={it =>
                    onChange({ importContainer: nullify({ ...config.importContainer, volume: it.target.value }) })
                  }
                  message={fieldErrors.find(it => it.path?.startsWith('importContainer.volume'))?.message}
                  disabled={disabled}
                />
                <DyoInput
                  label={t('common.command')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-2 w-40"
                  className="w-full"
                  grow
                  inline
                  value={config.importContainer?.command ?? ''}
                  placeholder={t('common.command')}
                  onChange={it =>
                    onChange({ importContainer: nullify({ ...config.importContainer, command: it.target.value }) })
                  }
                  disabled={disabled}
                />
                <div className="flex flex-col">
                  <KeyValueInput
                    label={t('common.environment')}
                    onChange={it =>
                      onChange({ importContainer: nullify({ ...config.importContainer, environment: it }) })
                    }
                    items={config.importContainer?.environment ?? []}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ports */}
        {filterContains('ports', selectedFilters) && (
          <div className="flex flex-col mb-2">
            <div className="flex flex-row mb-2">
              <DyoLabel className="mr-4 ext-bright font-semibold tracking-wide">
                {t('common.ports').toUpperCase()}
              </DyoLabel>
              {!disabled && (
                <DyoImgButton
                  onClick={() =>
                    setConfig({
                      ...config,
                      ports: [
                        ...config.ports,
                        {
                          id: uuid(),
                          external: undefined,
                          internal: undefined,
                        },
                      ],
                    })
                  }
                  src="/plus.svg"
                  alt="add"
                />
              )}
            </div>
            {/* port ranges fields */}
            {config.ports?.length < 1 ? null : (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 grid-flow-column gap-x-10 gap-y-8 mb-8">
                {config.ports?.map((item, index) => {
                  const message = fieldErrors.find(it => it.path?.startsWith(`ports[${index}]`))?.message
                  return (
                    <div key={`port-${index}`} className="flex-col p-1">
                      <div className="flex flex-row flex-grow">
                        <div className="w-6/12 ml-2">
                          <DyoInput
                            className="w-full mr-2"
                            grow
                            placeholder={t('common.internal')}
                            value={item.internal ?? ''}
                            type="number"
                            onChange={it => onComplexValueChange('ports', 'internal', it.target.value, index)}
                            disabled={disabled}
                          />
                        </div>

                        <div className="w-6/12 ml-2 mr-2">
                          <DyoInput
                            className="w-full mr-2"
                            grow
                            placeholder={t('common.external')}
                            value={item.external ?? ''}
                            type="number"
                            onChange={it => {
                              const targetValue = Number.parseInt(it.target.value, 10)
                              const value = Number.isNaN(targetValue) ? null : targetValue

                              onComplexValueChange('ports', 'external', value, index)
                            }}
                            disabled={disabled}
                          />
                        </div>
                        {!disabled && (
                          <DyoImgButton
                            onClick={() => {
                              const ports = [...config.ports]
                              ports.splice(index, 1)
                              onChange({ ports })
                            }}
                            src="/minus.svg"
                            alt="remove"
                            disabled={disabled}
                          />
                        )}
                      </div>
                      {message ? <DyoMessage message={message} messageType="error" marginClassName="m-2" /> : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* portRanges */}
        {filterContains('portRanges', selectedFilters) && (
          <div className="flex flex-col mb-2">
            <div className="flex flex-row mb-2">
              <DyoLabel className="mr-4 ext-bright font-semibold tracking-wide">
                {t('common.portRanges').toUpperCase()}
              </DyoLabel>
              {!disabled && (
                <DyoImgButton
                  onClick={() =>
                    setConfig({
                      ...config,
                      portRanges: [
                        ...config.portRanges,
                        {
                          id: uuid(),
                          external: { from: undefined, to: undefined },
                          internal: { from: undefined, to: undefined },
                        },
                      ],
                    })
                  }
                  src="/plus.svg"
                  alt="add"
                  disabled={disabled}
                />
              )}
            </div>
            {/* port ranges fields */}
            {config.portRanges?.length < 1 ? null : (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 grid-flow-column gap-x-10 gap-y-8 mb-8">
                {config.portRanges?.map((item, index) => {
                  const message = fieldErrors.find(it => it.path?.startsWith(`portRanges[${index}]`))?.message

                  return (
                    <div className="flex-col ml-2" key={`pr-${index}`}>
                      <div className="break-inside-avoid">
                        {/* internal part */}
                        <div className="grid">
                          <DyoLabel className="mb-2">{t('common.internal').toUpperCase()}</DyoLabel>
                          <div className="flex flex-row flex-grow p-1 mb-2">
                            <div className="w-5/12 ml-2">
                              <DyoInput
                                className="mr-4"
                                type="number"
                                grow
                                placeholder={t('common.from')}
                                value={item.internal?.from ?? ''}
                                onChange={it => {
                                  const internal: PortRange = {
                                    ...config.portRanges[index].internal,
                                    from: toNumber(it.target.value),
                                  }
                                  onComplexValueChange('portRanges', 'internal', internal, index)
                                }}
                                disabled={disabled}
                              />
                            </div>
                            <div className="w-7/12 ml-2 mr-8">
                              <DyoInput
                                type="number"
                                grow
                                placeholder={t('common.to')}
                                value={item?.internal?.to ?? ''}
                                onChange={it => {
                                  const internal: PortRange = {
                                    ...config.portRanges[index].internal,
                                    to: toNumber(it.target.value),
                                  }
                                  onComplexValueChange('portRanges', 'internal', internal, index)
                                }}
                                disabled={disabled}
                              />
                            </div>
                          </div>
                          {/* extarnal part */}
                          <DyoLabel className="mb-2">{t('common.external').toUpperCase()}</DyoLabel>
                          <div className="flex flex-row flex-grow p-1">
                            <div className="w-5/12 ml-2">
                              <DyoInput
                                className="mr-4"
                                type="number"
                                grow
                                placeholder={t('common.from')}
                                value={item?.external?.from ?? ''}
                                onChange={it => {
                                  const external: PortRange = {
                                    ...config.portRanges[index].external,
                                    from: toNumber(it.target.value),
                                  }
                                  onComplexValueChange('portRanges', 'external', external, index)
                                }}
                                disabled={disabled}
                              />
                            </div>
                            <div className="w-7/12 ml-2 mr-2">
                              <DyoInput
                                type="number"
                                grow
                                placeholder={t('common.to')}
                                value={item?.external?.to ?? ''}
                                onChange={it => {
                                  const external: PortRange = {
                                    ...config.portRanges[index].external,
                                    to: toNumber(it.target.value),
                                  }
                                  onComplexValueChange('portRanges', 'external', external, index)
                                }}
                                disabled={disabled}
                              />
                            </div>
                            {!disabled && (
                              <DyoImgButton
                                onClick={() => {
                                  const portRanges = [...config.portRanges]
                                  portRanges.splice(index, 1)
                                  onChange({ portRanges })
                                }}
                                src="/minus.svg"
                                alt="remove"
                                disabled={disabled}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      {message ? <DyoMessage message={message} messageType="error" marginClassName="m-2" /> : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* volumes */}
        {filterContains('volumes', selectedFilters) && (
          <div className="flex flex-col">
            <div className="flex flex-row mb-4">
              <DyoLabel className="mr-4 ext-bright font-semibold tracking-wide">
                {t('common.volumes').toUpperCase()}
              </DyoLabel>
              {!disabled && (
                <DyoImgButton
                  onClick={() =>
                    setConfig({
                      ...config,
                      volumes: [
                        ...config.volumes,
                        {
                          id: uuid(),
                          name: undefined,
                          path: undefined,
                          type: 'ro',
                        },
                      ],
                    })
                  }
                  src="/plus.svg"
                  alt="add"
                  disabled={disabled}
                />
              )}
            </div>
            {/* volume fields */}
            {config.volumes?.length < 1 ? null : (
              <div className="grid grid-cols-1 xl:grid-cols-2 grid-flow-column ml-2 gap-x-20 gap-y-14 mb-8">
                {config.volumes.map((item: ContainerConfigVolume, index) => {
                  const message = fieldErrors.find(it => it.path?.startsWith(`volumes[${index}]`))?.message
                  return (
                    <div key={index} className="flex flex-col ml-2">
                      <div className="grid break-inside-avoid">
                        <div className="flex flex-row">
                          <DyoInput
                            label={t('common:name')}
                            containerClassName="basis-2/3"
                            labelClassName="my-auto mr-4"
                            grow
                            inline
                            value={item.name ?? ''}
                            onChange={it => onComplexValueChange('volumes', 'name', it.target.value, index)}
                            disabled={disabled}
                          />
                          <DyoInput
                            label={t('common.size')}
                            containerClassName="basis-1/3 ml-4"
                            labelClassName="my-auto mr-4"
                            grow
                            inline
                            value={item.size ?? ''}
                            onChange={it => onComplexValueChange('volumes', 'size', it.target.value, index)}
                            disabled={disabled}
                          />
                        </div>
                        <div className="flex flex-row my-4">
                          <DyoInput
                            label={t('common.path')}
                            containerClassName="basis-1/2"
                            labelClassName="my-auto mr-7"
                            grow
                            inline
                            value={item.path ?? ''}
                            onChange={it => onComplexValueChange('volumes', 'path', it.target.value, index)}
                            disabled={disabled}
                          />
                          <DyoInput
                            label={t('common.class')}
                            containerClassName="basis-1/2 ml-4"
                            labelClassName="my-auto mr-4"
                            grow
                            inline
                            value={item.class ?? ''}
                            onChange={it => onComplexValueChange('volumes', 'class', it.target.value, index)}
                            disabled={disabled}
                          />
                        </div>
                        <div className="flex flex-row justify-between">
                          <div className="flex flex-col">
                            <DyoLabel className="my-auto mr-4">{t('common.type')}</DyoLabel>
                            <DyoChips
                              choices={CONTAINER_VOLUME_TYPE_VALUES}
                              initialSelection={item.type}
                              converter={(it: VolumeType) => t(`common.volumeTypes.${it}`)}
                              onSelectionChange={it => onComplexValueChange('volumes', 'type', it, index)}
                              disabled={disabled}
                            />
                          </div>
                          {!disabled && (
                            <DyoImgButton
                              className="!items-end pb-2"
                              onClick={() => {
                                const volumes = [...config.volumes]
                                volumes.splice(index, 1)
                                onChange({ volumes })
                              }}
                              src="/minus.svg"
                              alt="remove"
                              disabled={disabled}
                            />
                          )}
                        </div>
                      </div>
                      {message ? <DyoMessage message={message} messageType="error" marginClassName="mt-2" /> : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* initContainers */}
        {filterContains('initContainers', selectedFilters) && (
          <div className="flex flex-col">
            <div className="flex flex-row mb-4">
              <DyoLabel className="mr-4 ext-bright font-semibold tracking-wide">
                {t('common.initContainers').toUpperCase()}
              </DyoLabel>
              {!disabled && (
                <DyoImgButton
                  onClick={() =>
                    setConfig({
                      ...config,
                      initContainers: [
                        ...config.initContainers,
                        {
                          id: uuid(),
                          name: undefined,
                          image: undefined,
                          args: [],
                          command: [],
                          environment: [],
                          volumes: [],
                        },
                      ],
                    })
                  }
                  src="/plus.svg"
                  alt="add"
                  disabled={disabled}
                />
              )}
            </div>
            {/* init container fields */}
            {config.initContainers?.length < 1 ? null : (
              <div
                className={clsx(
                  'columns-1 lg:columns-2 2xl:columns-3 gap-x-20',
                  config.initContainers?.length > 0 ? null : 'mb-8',
                )}
              >
                {config.initContainers.map((item: InitContainer, index) => {
                  const message = fieldErrors.find(it => it.path?.startsWith(`initContainers[${index}]`))?.message
                  return (
                    <div key={index} className="flex flex-col ml-2 mb-8 break-inside-avoid">
                      <div className="grid">
                        <DyoInput
                          label={t('common:name').toUpperCase()}
                          containerClassName="max-w-lg mb-3"
                          labelClassName="my-auto mr-2 w-20"
                          grow
                          inline
                          value={item.name ?? ''}
                          onChange={it => onComplexValueChange('initContainers', 'name', it.target.value, index)}
                          disabled={disabled}
                        />
                        <DyoInput
                          label={t('common.image').toUpperCase()}
                          containerClassName="max-w-lg mb-3"
                          labelClassName="my-auto mr-2 w-20"
                          grow
                          inline
                          value={item.image ?? ''}
                          onChange={it => onComplexValueChange('initContainers', 'image', it.target.value, index)}
                          disabled={disabled}
                        />
                        <div className="flex flex-col mb-2">
                          <DyoLabel className="mb-2">{t('common.volumes').toUpperCase()}</DyoLabel>
                          <KeyValueInput
                            className="w-full"
                            keyPlaceholder={t('common.name')}
                            valuePlaceholder={t('common.path')}
                            items={item.volumes?.map(it => ({ id: it.id, key: it.name, value: it.path })) ?? []}
                            onChange={it => {
                              const values = it.map(
                                i => ({ id: i.id, name: i.key, path: i.value } as InitContainerVolumeLink),
                              )
                              onComplexValueChange('initContainers', 'volumes', values, index)
                            }}
                            editorOptions={editorOptions}
                            disabled={disabled}
                          />
                        </div>
                        <div className="flex flex-col mb-2">
                          <DyoLabel className="mb-2">{t('common.args').toUpperCase()}</DyoLabel>
                          <KeyOnlyInput
                            keyPlaceholder={t('common.args')}
                            onChange={it => onComplexValueChange('initContainers', 'args', it, index)}
                            items={item.args ?? []}
                            editorOptions={editorOptions}
                            disabled={disabled}
                          />
                        </div>
                        <div className="flex flex-col mb-2">
                          <DyoLabel className="mb-2">{t('common.command').toUpperCase()}</DyoLabel>
                          <KeyOnlyInput
                            keyPlaceholder={t('common.command')}
                            onChange={it => onComplexValueChange('initContainers', 'command', it, index)}
                            items={item.command ?? []}
                            editorOptions={editorOptions}
                            disabled={disabled}
                          />
                        </div>
                        <div className="flex flex-col mb-2">
                          <DyoLabel className="mb-2">{t('common.environment').toUpperCase()}</DyoLabel>
                          <KeyValueInput
                            onChange={it => onComplexValueChange('initContainers', 'environment', it, index)}
                            items={item.environment ?? []}
                            editorOptions={editorOptions}
                            disabled={disabled}
                          />
                        </div>
                        <div className="flex flex-row justify-between">
                          <div className="flex flex-row">
                            <DyoLabel className="my-auto mr-4">{t('common.useParent').toLocaleUpperCase()}</DyoLabel>

                            <DyoSwitch
                              checked={item.useParentConfig}
                              onCheckedChange={it =>
                                onComplexValueChange('initContainers', 'useParentConfig', it, index)
                              }
                              disabled={disabled}
                            />
                          </div>
                          {!disabled && (
                            <DyoImgButton
                              onClick={() => {
                                const initContainers = [...config.initContainers]
                                initContainers.splice(index, 1)
                                onChange({ initContainers })
                              }}
                              src="/minus.svg"
                              alt="remove"
                              disabled={disabled}
                            />
                          )}
                        </div>
                      </div>
                      {message ? <DyoMessage message={message} messageType="error" marginClassName="mt-2" /> : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommonConfigSection
