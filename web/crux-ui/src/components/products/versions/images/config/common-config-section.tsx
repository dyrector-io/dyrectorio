import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoImgButton from '@app/elements/dyo-img-button'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoSwitch from '@app/elements/dyo-switch'
import { ImageConfigFilterType } from '@app/models'
import {
  CommonConfigDetails,
  ContainerConfig,
  ContainerConfigExposeStrategy,
  ContainerConfigPort,
  ContainerConfigVolume,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  InitContainer,
  InitContainerVolumeLink,
  PortRange,
  VolumeType,
} from '@app/models/container'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'

interface CommonConfigSectionProps {
  config: CommonConfigDetails
  onChange: (config: Partial<ContainerConfig>) => void
  filters: ImageConfigFilterType[]
}

const CommonConfigSection = (props: CommonConfigSectionProps) => {
  const { t } = useTranslation('images')
  const { config: propsConfig, onChange: propsOnChange, filters } = props

  const [config, setConfig] = useState<CommonConfigDetails>(propsConfig)

  const contains = (filter: ImageConfigFilterType): boolean => filters.indexOf(filter) !== -1

  const toNumber = (value: string): number => {
    if (!value) {
      return undefined
    }

    return Number.isNaN(value) ? 0 : Number(value)
  }

  const onChange = (newConfig: Partial<ContainerConfig>) => {
    setConfig({ ...config, ...newConfig })
    propsOnChange(newConfig)
  }

  const onComplexValueChanged = <T,>(property: string, field: string, value: T, index: number) => {
    const newValue = {
      ...config[property][index],
      [field]: value,
    }

    const list = [...config[property].filter(p => p.id !== newValue.id), newValue]

    onChange({ [property]: list })
  }

  return (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright font-semibold tracking-wide bg-orange-400/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('common').toUpperCase()}
      </DyoHeading>
      <div className="flex flex-col border-2 rounded-lg rounded-tl-[0px] border-solid border-orange-400/50 p-8 w-full">
        <div className="columns-1 lg:columns-2 2xl:columns-3 gap-24">
          {/* name */}
          {contains('name') && (
            <div className="grid break-inside-avoid mb-8">
              <DyoInput
                label={t('containerName').toUpperCase()}
                containerClassName="max-w-lg mb-3"
                labelClassName={'text-bright font-semibold tracking-wide mb-2 my-auto mr-4'}
                grow
                inline
                value={config.name ?? ''}
                placeholder={t('containerName')}
                onChange={it => onChange({ name: it.target.value })}
              />
            </div>
          )}

          {/* user */}
          {contains('user') && (
            <div className="grid break-inside-avoid mb-8">
              <DyoInput
                label={t('common.user').toUpperCase()}
                containerClassName="max-w-lg mb-3"
                labelClassName={'text-bright font-semibold tracking-wide mb-2 my-auto mr-4'}
                grow
                inline
                value={config.user ?? ''}
                placeholder={t('common.placeholders.userIdNumber')}
                onChange={it => onChange({ user: toNumber(it.target.value) })}
              />
            </div>
          )}

          {/* expose */}
          {contains('expose') && (
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
              />
            </div>
          )}

          {/* tty */}
          {contains('tty') && (
            <div className="flex flex-row break-inside-avoid mb-8">
              <DyoLabel className="text-bright font-semibold tracking-wide mb-2 mr-2">
                {t('common.tty').toUpperCase()}
              </DyoLabel>
              <DyoSwitch fieldName="tty" checked={config.tty} onCheckedChange={it => onChange({ tty: it })} />
            </div>
          )}

          {/* ingress */}
          {contains('ingress') && (
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
                  onChange={it => onChange({ ingress: { ...config.ingress, name: it.target.value } })}
                />
                <DyoInput
                  label={t('common.ingressHost')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.ingress?.host ?? ''}
                  placeholder={t('common.placeholders.ingressHost')}
                  onChange={it => onChange({ ingress: { ...config.ingress, host: it.target.value } })}
                />
                <DyoInput
                  label={t('common.ingressUploadLimit')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.ingress?.uploadLimitInBytes ?? ''}
                  placeholder={t('common.placeholders.ingressUploadLimit')}
                  onChange={it => onChange({ ingress: { ...config.ingress, uploadLimitInBytes: it.target.value } })}
                />
              </div>
            </div>
          )}

          {/* configContainer */}
          {contains('configContainer') && (
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
                  value={config.configContainer?.image}
                  onChange={it => onChange({ configContainer: { ...config.configContainer, image: it.target.value } })}
                />
                <DyoInput
                  label={t('common.volume')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.configContainer?.volume}
                  onChange={it => onChange({ configContainer: { ...config.configContainer, volume: it.target.value } })}
                />
                <div className="flex flex-row break-inside-avoid mb-8">
                  <DyoLabel className="my-auto mr-12">{t('common.keepFiles')}</DyoLabel>
                  <DyoSwitch
                    fieldName="configContainer.keepFiles"
                    checked={config.configContainer?.keepFiles}
                    onCheckedChange={it => onChange({ configContainer: { ...config.configContainer, keepFiles: it } })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* environments */}
          {contains('environments') && (
            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                labelClassName={'text-bright font-semibold tracking-wide mb-2'}
                label={t('common.environments').toUpperCase()}
                onChange={it => onChange({ environments: it })}
                items={config.environments}
              />
            </div>
          )}

          {/* capabilities */}
          {contains('capabilities') && (
            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                labelClassName={'text-bright font-semibold tracking-wide mb-2'}
                label={t('capabilities').toUpperCase()}
                onChange={it => onChange({ capabilities: it })}
                items={config.capabilities}
              />
            </div>
          )}

          {/* ports */}
          {contains('ports') && (
            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                type="number"
                labelClassName={'text-bright font-semibold tracking-wide mb-2'}
                label={t('ports').toUpperCase()}
                keyPlaceholder={t('common.internal')}
                valuePlaceholder={t('common.external')}
                onChange={it => {
                  const values = it.map(
                    i =>
                      ({
                        id: i.id,
                        internal: toNumber(i.key),
                        external: toNumber(i.value),
                      } as ContainerConfigPort),
                  )
                  onChange({ ports: values })
                }}
                items={config.ports?.map(it => ({
                  id: it.id,
                  key: it.internal.toString(),
                  value: it.external.toString(),
                }))}
              />
            </div>
          )}

          {/* secrets */}
          {contains('secrets') && (
            <div className="grid break-inside-avoid mb-8 max-w-lg">
              <KeyOnlyInput
                className="mb-2"
                keyPlaceholder={t('common.secrets').toUpperCase()}
                labelClassName={'text-bright font-semibold tracking-wide mb-2'}
                label={t('common.secrets').toUpperCase()}
                onChange={it => onChange({ secrets: it })}
                items={config.secrets}
              />
            </div>
          )}

          {/* args */}
          {contains('args') && (
            <div className="grid break-inside-avoid mb-8 max-w-lg">
              <KeyOnlyInput
                className="mb-2"
                keyPlaceholder={t('common.args')}
                label={t('common.args').toUpperCase()}
                labelClassName={'text-bright font-semibold tracking-wide mb-2'}
                onChange={it => onChange({ args: it })}
                items={config.args}
              />
            </div>
          )}

          {/* commands */}
          {contains('commands') && (
            <div className="grid break-inside-avoid mb-8 max-w-lg">
              <KeyOnlyInput
                className="mb-2"
                keyPlaceholder={t('common.commands')}
                label={t('common.commands').toUpperCase()}
                labelClassName={'text-bright font-semibold tracking-wide mb-2'}
                onChange={it => onChange({ commands: it })}
                items={config.commands}
              />
            </div>
          )}

          {/* importContainer */}
          {contains('importContainer') && (
            <div className="grid mb-8 break-inside-avoid">
              <DyoLabel className="text-bright font-semibold tracking-wide mb-2">
                {t('common.importContainer').toUpperCase()}
              </DyoLabel>
              <div className="ml-2">
                <DyoInput
                  label={t('common.volume')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-2 w-60"
                  className="w-full"
                  grow
                  inline
                  value={config.importContainer?.volume}
                  placeholder={t('common.volume')}
                  onChange={it => onChange({ importContainer: { ...config.importContainer, volume: it.target.value } })}
                />
                <DyoInput
                  label={t('common.command')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-2 w-60"
                  className="w-full"
                  grow
                  inline
                  value={config.importContainer?.command}
                  placeholder={t('common.command')}
                  onChange={it =>
                    onChange({ importContainer: { ...config.importContainer, command: it.target.value } })
                  }
                />
                <div className="flex flex-col">
                  <KeyValueInput
                    label={t('common.environments')}
                    onChange={it => onChange({ importContainer: { ...config.importContainer, environments: it } })}
                    items={config.importContainer.environments}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* portRanges */}
        {contains('portRanges') && (
          <div className="flex flex-col mb-4 w-60">
            <div className="flex flex-row">
              <DyoLabel className="mr-4">{t('common.portRanges').toUpperCase()}</DyoLabel>
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
                alt={'add'}
              />
            </div>
            <div className="flex flex-row flex-wrap">
              {config.portRanges?.map((item, index) => (
                <div className="flex flex-col mb-4" key={`pr-${index}`}>
                  <DyoLabel className="mb-2">{t('common.internal').toUpperCase()}</DyoLabel>
                  <div className="flex flex-row mb-2 w-[50%]">
                    <DyoInput
                      className="mr-2"
                      type="number"
                      placeholder={t('common.from')}
                      value={item.internal?.from ?? ''}
                      onChange={it => {
                        const internal: PortRange = {
                          ...config.portRanges[index].internal,
                          from: toNumber(it.target.value),
                        }
                        onComplexValueChanged('portRanges', 'internal', internal, index)
                      }}
                    />
                    <DyoInput
                      type="number"
                      placeholder={t('common.to')}
                      value={item?.internal?.to ?? ''}
                      onChange={it => {
                        const internal: PortRange = {
                          ...config.portRanges[index].internal,
                          to: toNumber(it.target.value),
                        }
                        onComplexValueChanged('portRanges', 'internal', internal, index)
                      }}
                    />
                  </div>
                  <DyoLabel className="mb-2">{t('common.external').toUpperCase()}</DyoLabel>
                  <div className="flex flex-row mb-2 w-[50%]">
                    <DyoInput
                      className="mr-2"
                      type="number"
                      placeholder={t('common.from')}
                      value={item?.external?.from ?? ''}
                      onChange={it => {
                        const external: PortRange = {
                          ...config.portRanges[index].external,
                          from: toNumber(it.target.value),
                        }
                        onComplexValueChanged('portRanges', 'external', external, index)
                      }}
                    />
                    <DyoInput
                      type="number"
                      className="mr-2"
                      placeholder={t('common.to')}
                      value={item?.external?.to ?? ''}
                      onChange={it => {
                        const external: PortRange = {
                          ...config.portRanges[index].external,
                          to: toNumber(it.target.value),
                        }
                        onComplexValueChanged('portRanges', 'external', external, index)
                      }}
                    />
                    <DyoImgButton
                      onClick={() => {
                        const portRanges = [...config.portRanges]
                        portRanges.splice(index, 1)
                        setConfig({ ...config, portRanges })
                      }}
                      src="/minus.svg"
                      alt={'add'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* volumes */}
        {contains('volumes') && (
          <div className="flex flex-col mb-4">
            <div className="flex flex-row">
              <DyoLabel className="mr-4">{t('common.volumes').toUpperCase()}</DyoLabel>
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
                alt={'add'}
              />
            </div>
            <div className="flex flex-row flex-wrap gap-8">
              {config.volumes.map((item: ContainerConfigVolume, index) => {
                return (
                  <div key={index} className="flex flex-col break-inside-avoid max-w-[30%]">
                    <div className="flex flex-row my-4">
                      <DyoInput
                        label={t('common:name').toUpperCase()}
                        containerClassName="basis-3/4"
                        labelClassName="my-auto mr-4"
                        className="w-full"
                        grow
                        inline
                        value={item.name ?? ''}
                        onChange={it => onComplexValueChanged('volumes', 'name', it.target.value, index)}
                      />
                      <DyoInput
                        label={t('common.size').toUpperCase()}
                        containerClassName="basis-1/4 ml-4"
                        labelClassName="my-auto mr-4"
                        grow
                        inline
                        value={item.size ?? ''}
                        onChange={it => onComplexValueChanged('volumes', 'size', it.target.value, index)}
                      />
                    </div>
                    <div className="flex flex-row my-4">
                      <DyoInput
                        label={t('common.path').toUpperCase()}
                        containerClassName="basis-1/2"
                        labelClassName="my-auto mr-4"
                        grow
                        inline
                        value={item.path ?? ''}
                        onChange={it => onComplexValueChanged('volumes', 'path', it.target.value, index)}
                      />
                      <DyoInput
                        label={t('common.class').toUpperCase()}
                        containerClassName="basis-1/2 ml-4"
                        labelClassName="my-auto mr-4"
                        grow
                        inline
                        value={item.class ?? ''}
                        onChange={it => onComplexValueChanged('volumes', 'class', it.target.value, index)}
                      />
                    </div>
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-col">
                        <DyoLabel className="my-auto mr-4">{t('common.type').toLocaleUpperCase()}</DyoLabel>

                        <DyoChips
                          choices={CONTAINER_VOLUME_TYPE_VALUES}
                          initialSelection={item.type}
                          converter={(it: VolumeType) => t(`common.volumeTypes.${it}`)}
                          onSelectionChange={it => onComplexValueChanged('volumes', 'type', it, index)}
                        />
                      </div>
                      <DyoImgButton
                        onClick={() => {
                          const volumes = [...config.volumes]
                          volumes.splice(index, 1)
                          setConfig({ ...config, volumes })
                        }}
                        src="/minus.svg"
                        alt={'add'}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* initContainers */}
        {contains('initContainers') && (
          <div className="flex flex-col">
            <div className="flex flex-row mb-4">
              <DyoLabel className="mr-4">{t('common.initContainers').toUpperCase()}</DyoLabel>
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
                        environments: [],
                        volumes: [],
                      },
                    ],
                  })
                }
                src="/plus.svg"
                alt={'add'}
              />
            </div>
            <div className="flex flex-row flex-wrap gap-8">
              {config.initContainers.map((item: InitContainer, index) => {
                return (
                  <div key={index} className="flex flex-col break-inside-avoid max-w-[40%]">
                    <DyoInput
                      label={t('common:name').toUpperCase()}
                      containerClassName="max-w-lg mb-3"
                      labelClassName="my-auto mr-2 w-60"
                      className="w-full"
                      grow
                      inline
                      value={item.name ?? ''}
                      onChange={it => onComplexValueChanged('initContainers', 'name', it.target.value, index)}
                    />
                    <DyoInput
                      label={t('common.image').toUpperCase()}
                      containerClassName="max-w-lg mb-3"
                      labelClassName="my-auto mr-2 w-60"
                      className="w-full"
                      grow
                      inline
                      value={item.image ?? ''}
                      onChange={it => onComplexValueChanged('initContainers', 'image', it.target.value, index)}
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

                          onComplexValueChanged('initContainers', 'volumes', values, index)
                        }}
                      />
                    </div>
                    <div className="flex flex-col mb-2">
                      <DyoLabel className="mb-2">{t('common.args').toUpperCase()}</DyoLabel>
                      <KeyOnlyInput
                        keyPlaceholder={t('common.args')}
                        onChange={it => onComplexValueChanged('initContainers', 'args', it, index)}
                        items={item.args}
                      />
                    </div>
                    <div className="flex flex-col mb-2">
                      <DyoLabel className="mb-2">{t('common.command').toUpperCase()}</DyoLabel>
                      <KeyOnlyInput
                        keyPlaceholder={t('common.command')}
                        onChange={it => onComplexValueChanged('initContainers', 'command', it, index)}
                        items={item.command}
                      />
                    </div>
                    <div className="flex flex-col mb-2">
                      <DyoLabel className="mb-2">{t('common.environments').toUpperCase()}</DyoLabel>
                      <KeyValueInput
                        onChange={it => onComplexValueChanged('initContainers', 'environments', it, index)}
                        items={item.environments}
                      />
                    </div>
                    <div className="flex flex-row justify-between">
                      <div className="flex flex-col">
                        <DyoLabel className="my-auto mb-2">{t('common.useParent').toLocaleUpperCase()}</DyoLabel>

                        <DyoSwitch
                          checked={item.useParentConfig}
                          onCheckedChange={it => onComplexValueChanged('initContainers', 'useParentConfig', it, index)}
                        />
                      </div>
                      <DyoImgButton
                        onClick={() => {
                          const initContainers = [...config.initContainers]
                          initContainers.splice(index, 1)
                          onChange({ initContainers })
                        }}
                        src="/minus.svg"
                        alt={'add'}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommonConfigSection
