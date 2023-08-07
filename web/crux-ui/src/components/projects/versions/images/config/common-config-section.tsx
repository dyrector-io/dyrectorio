import MultiInput from '@app/components/editor/multi-input'
import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import SecretKeyInput from '@app/components/shared/secret-key-input'
import SecretKeyValueInput from '@app/components/shared/secret-key-value-input'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoToggle from '@app/elements/dyo-toggle'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  COMMON_CONFIG_PROPERTIES,
  CommonConfigProperty,
  ImageConfigProperty,
  StorageOption,
  filterContains,
  filterEmpty,
} from '@app/models'
import {
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  CommonConfigDetails,
  ContainerConfigData,
  ContainerConfigExposeStrategy,
  ContainerConfigVolume,
  InitContainerVolumeLink,
  InstanceCommonConfigDetails,
  VolumeType,
  mergeConfigs,
} from '@app/models/container'
import { fetcher, toNumber } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import useSWR from 'swr'
import { v4 as uuid } from 'uuid'
import { ValidationError } from 'yup'
import ConfigSectionLabel from './config-section-label'
import ExtendableItemList from './extendable-item-list'

type CommonConfigSectionBaseProps<T> = {
  disabled?: boolean
  selectedFilters: ImageConfigProperty[]
  editorOptions: ItemEditorState
  config: T
  resetableConfig?: T
  onChange: (config: Partial<T>) => void
  onResetSection: (section: CommonConfigProperty) => void
  fieldErrors: ValidationError[]
  definedSecrets?: string[]
  publicKey?: string
}

type ImageCommonConfigSectionProps = CommonConfigSectionBaseProps<CommonConfigDetails> & {
  configType: 'image'
}

type InstanceCommonConfigSectionProps = CommonConfigSectionBaseProps<InstanceCommonConfigDetails> & {
  configType: 'instance'
  imageConfig: ContainerConfigData
}

type CommonConfigSectionProps = ImageCommonConfigSectionProps | InstanceCommonConfigSectionProps

const CommonConfigSection = (props: CommonConfigSectionProps) => {
  const { t } = useTranslation('container')
  const routes = useTeamRoutes()

  const {
    disabled,
    onChange,
    onResetSection,
    selectedFilters,
    editorOptions,
    fieldErrors,
    configType,
    definedSecrets,
    publicKey,
    config: propsConfig,
    resetableConfig: propsResetableConfig,
  } = props

  const { data: storages } = useSWR<StorageOption[]>(routes.storage.api.options(), fetcher)

  const disabledOnImage = configType === 'image' || disabled
  // eslint-disable-next-line react/destructuring-assignment
  const imageConfig = configType === 'instance' ? props.imageConfig : null
  const resetableConfig = propsResetableConfig ?? propsConfig
  const config = configType === 'instance' ? mergeConfigs(imageConfig, propsConfig) : propsConfig

  const onVolumesChanged = (it: ContainerConfigVolume[]) =>
    onChange({
      volumes: it,
      storage:
        config.storage?.path && it.every(volume => volume.path !== config.storage.path)
          ? {
              ...config.storage,
              path: '',
            }
          : undefined,
    })

  return !filterEmpty([...COMMON_CONFIG_PROPERTIES], selectedFilters) ? null : (
    <div className="my-4">
      <DyoHeading className="text-lg text-bright font-semibold tracking-wide bg-dyo-orange/50 w-40 rounded-t-lg text-center pt-[2px]">
        {t('base.common').toUpperCase()}
      </DyoHeading>

      <div className="flex flex-col border-2 rounded-lg rounded-tl-[0px] border-solid border-dyo-orange/50 p-8 w-full">
        <div className="columns-1 lg:columns-2 2xl:columns-3 gap-x-20">
          {/* name */}
          {filterContains('name', selectedFilters) && (
            <div className="grid break-inside-avoid mb-4">
              <div className="flex flex-row gap-4 items-center">
                <ConfigSectionLabel
                  disabled={disabledOnImage || config.name === imageConfig?.name}
                  onResetSection={() => onResetSection('name')}
                >
                  {t('common.containerName').toUpperCase()}
                </ConfigSectionLabel>

                <MultiInput
                  id="common.containerName"
                  containerClassName="max-w-lg mb-3"
                  labelClassName="text-bright font-semibold tracking-wide mb-2 my-auto mr-4"
                  grow
                  value={config.name ?? ''}
                  placeholder={t('common.containerName')}
                  onPatch={it => onChange({ name: it })}
                  editorOptions={editorOptions}
                  message={fieldErrors.find(it => it.path?.startsWith('name'))?.message}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {/* user */}
          {filterContains('user', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8">
              <div className="flex flex-row gap-4 items-start">
                <ConfigSectionLabel
                  className="mt-2.5"
                  disabled={
                    disabled || configType === 'image'
                      ? resetableConfig?.user === -1
                      : !resetableConfig?.user && resetableConfig.user !== 0
                  }
                  onResetSection={() => onResetSection('user')}
                >
                  {t('common.user').toUpperCase()}
                </ConfigSectionLabel>

                <MultiInput
                  id="common.user"
                  containerClassName="max-w-lg mb-3"
                  labelClassName="text-bright font-semibold tracking-wide mb-2 my-auto mr-4"
                  grow
                  value={config.user === -1 ? '' : config.user}
                  placeholder={t('common.placeholders.containerDefault')}
                  onPatch={it => {
                    const val = toNumber(it)
                    onChange({ user: configType === 'instance' || val === 0 ? val : val ?? -1 })
                  }}
                  editorOptions={editorOptions}
                  message={fieldErrors.find(it => it.path?.startsWith('user'))?.message}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {/* expose */}
          {filterContains('expose', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8">
              <ConfigSectionLabel
                disabled={disabledOnImage || !resetableConfig?.expose}
                onResetSection={() => onResetSection('expose')}
              >
                {t('common.exposeStrategy').toUpperCase()}
              </ConfigSectionLabel>

              <DyoChips
                className="ml-2"
                choices={CONTAINER_EXPOSE_STRATEGY_VALUES}
                selection={config.expose}
                converter={(it: ContainerConfigExposeStrategy) => t(`common.exposeStrategies.${it}`)}
                onSelectionChange={it => onChange({ expose: it })}
                disabled={disabled}
              />
            </div>
          )}

          {/* tty */}
          {filterContains('tty', selectedFilters) && (
            <div className="flex flex-row break-inside-avoid mb-8">
              <ConfigSectionLabel
                disabled={disabledOnImage || resetableConfig.tty === null}
                onResetSection={() => onResetSection('tty')}
              >
                {t('common.tty').toUpperCase()}
              </ConfigSectionLabel>

              <DyoToggle
                className="ml-2"
                name="tty"
                checked={config.tty}
                disabled={disabled}
                onCheckedChange={it => onChange({ tty: it })}
              />
            </div>
          )}

          {/* configContainer */}
          {filterContains('configContainer', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8">
              <ConfigSectionLabel
                disabled={disabled || !resetableConfig.configContainer}
                onResetSection={() => onResetSection('configContainer')}
              >
                {t('common.configContainer').toUpperCase()}
              </ConfigSectionLabel>

              <div className="ml-2">
                <MultiInput
                  id="common.configContainer.image"
                  label={t('common.image')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.configContainer?.image ?? ''}
                  onPatch={it => onChange({ configContainer: { ...config.configContainer, image: it } })}
                  editorOptions={editorOptions}
                  message={fieldErrors.find(it => it.path?.startsWith('configContainer.image'))?.message}
                  disabled={disabled}
                />

                <MultiInput
                  id="common.configContainer.volume"
                  label={t('common.volume')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.configContainer?.volume ?? ''}
                  onPatch={it => onChange({ configContainer: { ...config.configContainer, volume: it } })}
                  editorOptions={editorOptions}
                  message={fieldErrors.find(it => it.path?.startsWith('configContainer.volume'))?.message}
                  disabled={disabled}
                />

                <MultiInput
                  id="common.configContainer.path"
                  label={t('common.path')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.configContainer?.path ?? ''}
                  onPatch={it => onChange({ configContainer: { ...config.configContainer, path: it } })}
                  editorOptions={editorOptions}
                  message={fieldErrors.find(it => it.path?.startsWith('configContainer.path'))?.message}
                  disabled={disabled}
                />

                <DyoToggle
                  className="break-inside-avoid mb-8"
                  name="configContainer.keepFiles"
                  labelClassName="text-light-eased mr-11"
                  checked={config.configContainer?.keepFiles}
                  onCheckedChange={it => onChange({ configContainer: { ...config.configContainer, keepFiles: it } })}
                  disabled={disabled}
                  label={t('common.keepFiles')}
                />
              </div>
            </div>
          )}

          {/* routing */}
          {filterContains('routing', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8">
              <ConfigSectionLabel
                disabled={disabled || !resetableConfig.routing}
                onResetSection={() => onResetSection('routing')}
              >
                {t('common.routing').toUpperCase()}
              </ConfigSectionLabel>

              <div className="ml-2">
                <MultiInput
                  id="routing.domain"
                  label={t('common.domain')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.routing?.domain ?? ''}
                  placeholder={t('common.domain')}
                  onPatch={it => onChange({ routing: { ...config.routing, domain: it } })}
                  editorOptions={editorOptions}
                  message={fieldErrors.find(it => it.path?.startsWith('routing.domain'))?.message}
                  disabled={disabled}
                />

                <MultiInput
                  id="routing.path"
                  label={t('common.path')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.routing?.path ?? ''}
                  placeholder={t('common.path')}
                  onPatch={it => onChange({ routing: { ...config.routing, path: it } })}
                  editorOptions={editorOptions}
                  message={fieldErrors.find(it => it.path?.startsWith('routing.path'))?.message}
                  disabled={disabled}
                />

                <DyoToggle
                  id="routing.stripPath"
                  className="break-inside-avoid my-4"
                  labelClassName="text-light-eased mr-11"
                  name="routing.stripPath"
                  checked={config.routing?.stripPath ?? false}
                  onCheckedChange={it => onChange({ routing: { ...config.routing, stripPath: it } })}
                  disabled={disabled}
                  label={t('common.stripPath')}
                />

                <MultiInput
                  id="routing.uploadLimit"
                  label={t('common.uploadLimit')}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-4 w-40"
                  grow
                  inline
                  value={config.routing?.uploadLimit ?? ''}
                  placeholder={t('common.uploadLimit')}
                  onPatch={it => onChange({ routing: { ...config.routing, uploadLimit: it } })}
                  editorOptions={editorOptions}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {/* environment */}
          {filterContains('environment', selectedFilters) && (
            <div className="grid mb-8 break-inside-avoid">
              <KeyValueInput
                className="max-h-128 overflow-y-auto"
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                label={t('common.environment').toUpperCase()}
                onChange={it => onChange({ environment: it })}
                onResetSection={resetableConfig.environment ? () => onResetSection('environment') : null}
                items={config.environment}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          )}

          {/* secrets */}
          {filterContains('secrets', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8 max-w-lg">
              {configType === 'instance' ? (
                <SecretKeyValueInput
                  className="max-h-128 overflow-y-auto mb-2"
                  keyPlaceholder={t('common.secrets').toUpperCase()}
                  labelClassName="text-bright font-semibold tracking-wide mb-2"
                  label={t('common.secrets').toUpperCase()}
                  onSubmit={it => onChange({ secrets: it })}
                  items={propsConfig.secrets}
                  editorOptions={editorOptions}
                  definedSecrets={definedSecrets}
                  publicKey={publicKey}
                  disabled={disabled}
                />
              ) : (
                <SecretKeyInput
                  className="max-h-128 overflow-y-auto mb-2"
                  keyPlaceholder={t('common.secrets').toUpperCase()}
                  labelClassName="text-bright font-semibold tracking-wide mb-2"
                  label={t('common.secrets').toUpperCase()}
                  onChange={it => onChange({ secrets: it.map(sit => ({ ...sit })) })}
                  onResetSection={resetableConfig.secrets ? () => onResetSection('secrets') : null}
                  items={config.secrets}
                  editorOptions={editorOptions}
                  disabled={disabled}
                />
              )}
            </div>
          )}

          {/* commands */}
          {filterContains('commands', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8 max-w-lg">
              <KeyOnlyInput
                className="max-h-128 overflow-y-auto mb-2"
                keyPlaceholder={t('common.commands')}
                label={t('common.commands').toUpperCase()}
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                onChange={it => onChange({ commands: it })}
                onResetSection={resetableConfig.commands ? () => onResetSection('commands') : null}
                items={config.commands}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          )}

          {/* args */}
          {filterContains('args', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8 max-w-lg">
              <KeyOnlyInput
                className="max-h-128 overflow-y-auto mb-2"
                keyPlaceholder={t('common.arguments')}
                label={t('common.arguments').toUpperCase()}
                labelClassName="text-bright font-semibold tracking-wide mb-2"
                onChange={it => onChange({ args: it })}
                onResetSection={resetableConfig.args ? () => onResetSection('args') : null}
                items={config.args}
                editorOptions={editorOptions}
                disabled={disabled}
              />
            </div>
          )}
        </div>

        {/* storage */}
        {filterContains('storage', selectedFilters) && (
          <div className="grid mb-8 break-inside-avoid">
            <ConfigSectionLabel
              disabled={disabled || !resetableConfig.storage}
              onResetSection={() => onResetSection('storage')}
            >
              {t('common.storage').toUpperCase()}
            </ConfigSectionLabel>

            <div className="ml-2">
              <div className="max-w-lg mb-3 flex flex-row">
                <DyoLabel className="my-auto w-40 whitespace-nowrap text-light-eased">{t('common.storage')}</DyoLabel>

                <DyoChips
                  className="w-full ml-2"
                  choices={storages ? [null, ...storages.map(it => it.id)] : [null]}
                  selection={config.storage?.storageId ?? null}
                  converter={(it: string) => storages?.find(storage => storage.id === it)?.name ?? t('common.none')}
                  onSelectionChange={it =>
                    onChange({
                      storage: { ...config.storage, storageId: it },
                    })
                  }
                  disabled={disabled}
                />
              </div>

              <MultiInput
                id="common.storage.bucket"
                label={t('common.bucketPath')}
                containerClassName="max-w-lg mb-3"
                labelClassName="my-auto mr-2 w-40"
                className="w-full ml-1"
                grow
                inline
                value={config.storage?.bucket ?? ''}
                placeholder={t('common.bucketPath')}
                onPatch={it => onChange({ storage: { ...config.storage, bucket: it } })}
                editorOptions={editorOptions}
                disabled={disabled || !config.storage?.storageId}
                message={fieldErrors.find(it => it.path?.startsWith('storage.bucket'))?.message}
              />

              <div className="max-w-lg mb-3 flex flex-row">
                <DyoLabel className="my-auto w-40 whitespace-nowrap text-light-eased">{t('common.volume')}</DyoLabel>

                <DyoChips
                  className={clsx('w-full ml-2', disabled || !config.storage?.storageId ? 'opacity-50' : null)}
                  choices={config.volumes ? [null, ...config.volumes.filter(it => it.name).map(it => it.name)] : [null]}
                  selection={config.storage?.path ?? null}
                  converter={(it: string) =>
                    config.volumes?.find(volume => volume.name === it)?.name ?? t('common.none')
                  }
                  onSelectionChange={it =>
                    onChange({
                      storage: { ...config.storage, path: it },
                    })
                  }
                  disabled={disabled || !config.storage?.storageId}
                />
              </div>
              <DyoMessage
                message={fieldErrors.find(it => it.path?.startsWith('storage.path'))?.message}
                marginClassName="my-2"
                className="text-xs italic"
              />

              <DyoLabel textColor="text-light">{t('common.buketPathTips')}</DyoLabel>
            </div>
          </div>
        )}

        {/* ports */}
        {filterContains('ports', selectedFilters) && (
          <ExtendableItemList
            disabled={disabled}
            items={config.ports}
            label={t('common.ports')}
            onPatch={it => onChange({ ports: it })}
            onResetSection={resetableConfig.ports ? () => onResetSection('ports') : null}
            findErrorMessage={index => fieldErrors.find(it => it.path?.startsWith(`ports[${index}]`))?.message}
            emptyItemFactory={() => ({
              external: null,
              internal: null,
            })}
            renderItem={(item, removeButton, onPatch) => (
              <div className="flex flex-row flex-grow">
                <div className="w-6/12 ml-2">
                  <MultiInput
                    id={`common.ports-${item.id}-external`}
                    className="w-full mr-2"
                    grow
                    placeholder={t('common.external')}
                    value={item.external ?? ''}
                    type="number"
                    onPatch={it => {
                      const value = Number.parseInt(it, 10)
                      const external = Number.isNaN(value) ? null : value

                      onPatch({
                        external,
                      })
                    }}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                <div className="w-6/12 ml-2 mr-2">
                  <MultiInput
                    id={`common.ports-${item.id}-internal`}
                    className="w-full mr-2"
                    grow
                    placeholder={t('common.internal')}
                    value={item.internal ?? ''}
                    type="number"
                    onPatch={it =>
                      onPatch({
                        internal: toNumber(it),
                      })
                    }
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                {removeButton()}
              </div>
            )}
          />
        )}

        {/* portRanges */}
        {filterContains('portRanges', selectedFilters) && (
          <ExtendableItemList
            disabled={disabled}
            items={config.portRanges}
            label={t('common.portRanges')}
            emptyItemFactory={() => ({
              external: { from: null, to: null },
              internal: { from: null, to: null },
            })}
            findErrorMessage={index => fieldErrors.find(it => it.path?.startsWith(`portRanges[${index}]`))?.message}
            onPatch={it => onChange({ portRanges: it })}
            onResetSection={resetableConfig.portRanges ? () => onResetSection('portRanges') : null}
            renderItem={(item, removeButton, onPatch) => (
              <div className="flex flex-col gap-2">
                <DyoLabel>{t('common.internal').toUpperCase()}</DyoLabel>

                <div className="flex flex-row flex-grow gap-2 pl-2">
                  <MultiInput
                    id={`common.portRanges-${item.id}-internal.from`}
                    containerClassName="w-5/12"
                    type="number"
                    grow
                    placeholder={t('common.from')}
                    value={item.internal?.from ?? ''}
                    onPatch={it => onPatch({ ...item, internal: { ...item.internal, from: toNumber(it) } })}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />

                  <MultiInput
                    id={`common.portRanges-${item.id}-internal.to`}
                    containerClassName="w-7/12"
                    type="number"
                    grow
                    placeholder={t('common.to')}
                    value={item?.internal?.to ?? ''}
                    onPatch={it => onPatch({ ...item, internal: { ...item.internal, to: toNumber(it) } })}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                {/* external part */}
                <DyoLabel>{t('common.external').toUpperCase()}</DyoLabel>

                <div className="flex flex-row flex-grow gap-2 pl-2">
                  <MultiInput
                    id={`common.portRanges-${item.id}-external.from`}
                    containerClassName="w-5/12"
                    type="number"
                    grow
                    placeholder={t('common.from')}
                    value={item?.external?.from ?? ''}
                    onPatch={it => onPatch({ ...item, external: { ...item.external, from: toNumber(it) } })}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />

                  <MultiInput
                    id={`common.portRanges-${item.id}-external.to`}
                    containerClassName="w-7/12"
                    type="number"
                    grow
                    placeholder={t('common.to')}
                    value={item?.external?.to ?? ''}
                    onPatch={it => onPatch({ ...item, external: { ...item.external, to: toNumber(it) } })}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />

                  {removeButton()}
                </div>
              </div>
            )}
          />
        )}

        {/* volumes */}
        {filterContains('volumes', selectedFilters) && (
          <ExtendableItemList
            disabled={disabled}
            items={config.volumes}
            label={t('common.volumes')}
            itemClassName="grid grid-cols-1 xl:grid-cols-2 grid-flow-column ml-2 gap-x-20 gap-y-14 mb-8"
            emptyItemFactory={() => ({
              name: null,
              path: null,
              type: 'rwo' as VolumeType,
            })}
            findErrorMessage={index => fieldErrors.find(it => it.path?.startsWith(`volumes[${index}]`))?.message}
            onPatch={it => onVolumesChanged(it)}
            onResetSection={resetableConfig.volumes ? () => onResetSection('volumes') : null}
            renderItem={(item, removeButton, onPatch) => (
              <div className="grid break-inside-avoid">
                <div className="flex flex-row">
                  <MultiInput
                    id={`common.volumes-${item.id}-name`}
                    label={t('common:name')}
                    containerClassName="basis-2/3"
                    labelClassName="my-auto mr-4"
                    grow
                    inline
                    value={item.name ?? ''}
                    onPatch={it => onPatch({ name: it })}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />

                  <MultiInput
                    id={`common.volumes-${item.id}-size`}
                    label={t('common.size')}
                    containerClassName="basis-1/3 ml-4"
                    labelClassName="my-auto mr-4"
                    grow
                    inline
                    value={item.size ?? ''}
                    onPatch={it => onPatch({ size: it })}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                <div className="flex flex-row my-4">
                  <MultiInput
                    id={`common.volumes-${item.id}-path`}
                    label={t('common.path')}
                    containerClassName="basis-1/2"
                    labelClassName="my-auto mr-7"
                    grow
                    inline
                    value={item.path ?? ''}
                    onPatch={it => onPatch({ path: it })}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />

                  <MultiInput
                    id={`common.volumes-${item.id}-class`}
                    label={t('common.class')}
                    containerClassName="basis-1/2 ml-4"
                    labelClassName="my-auto mr-4"
                    grow
                    inline
                    value={item.class ?? ''}
                    onPatch={it => onPatch({ class: it })}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                <div className="flex flex-row justify-between">
                  <div className="flex flex-col flex-grow">
                    <DyoLabel className="my-auto mr-4">{t('common.type')}</DyoLabel>

                    <div className="flex flex-row">
                      <DyoChips
                        choices={CONTAINER_VOLUME_TYPE_VALUES}
                        selection={item.type}
                        converter={(it: VolumeType) => t(`common.volumeTypes.${it}`)}
                        onSelectionChange={it => onPatch({ type: it })}
                        disabled={disabled}
                      />

                      {removeButton('self-center ml-auto')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        )}

        {/* initContainers */}
        {filterContains('initContainers', selectedFilters) && (
          <ExtendableItemList
            disabled={disabled}
            items={config.initContainers}
            label={t('common.initContainers')}
            emptyItemFactory={() => ({
              id: uuid(),
              name: null,
              image: null,
              args: [],
              command: [],
              environment: [],
              volumes: [],
              useParentConfig: false,
            })}
            findErrorMessage={index => fieldErrors.find(it => it.path?.startsWith(`initContainers[${index}]`))?.message}
            onPatch={it => onChange({ initContainers: it })}
            onResetSection={resetableConfig.initContainers ? () => onResetSection('initContainers') : null}
            renderItem={(item, removeButton, onPatch) => (
              <div className="grid">
                <MultiInput
                  id={`common.initContainers-${item.id}-name`}
                  label={t('common:name').toUpperCase()}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-2 w-20"
                  grow
                  inline
                  value={item.name ?? ''}
                  onPatch={it => onPatch({ name: it })}
                  editorOptions={editorOptions}
                  disabled={disabled}
                />

                <MultiInput
                  id={`common.initContainers-${item.id}-image`}
                  label={t('common.image').toUpperCase()}
                  containerClassName="max-w-lg mb-3"
                  labelClassName="my-auto mr-2 w-20"
                  grow
                  inline
                  value={item.image ?? ''}
                  onPatch={it => onPatch({ image: it })}
                  editorOptions={editorOptions}
                  disabled={disabled}
                />

                <div className="flex flex-col mb-2">
                  <DyoLabel className="mb-2">{t('common.volumes').toUpperCase()}</DyoLabel>

                  <KeyValueInput
                    className="w-full max-h-128 overflow-y-auto"
                    keyPlaceholder={t('common.name')}
                    valuePlaceholder={t('common.path')}
                    items={item.volumes?.map(it => ({ id: it.id, key: it.name, value: it.path }))}
                    onChange={it => {
                      const volumes = it.map(i => ({ id: i.id, name: i.key, path: i.value }) as InitContainerVolumeLink)
                      onPatch({ volumes })
                    }}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                <div className="flex flex-col mb-2">
                  <DyoLabel className="mb-2">{t('common.arguments').toUpperCase()}</DyoLabel>

                  <KeyOnlyInput
                    className="max-h-128 overflow-y-auto"
                    keyPlaceholder={t('common.arguments')}
                    onChange={it => onPatch({ args: it })}
                    items={item.args}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                <div className="flex flex-col mb-2">
                  <DyoLabel className="mb-2">{t('common.command').toUpperCase()}</DyoLabel>

                  <KeyOnlyInput
                    className="max-h-128 overflow-y-auto"
                    keyPlaceholder={t('common.command')}
                    onChange={it => onPatch({ command: it })}
                    items={item.command}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                <div className="flex flex-col mb-2">
                  <DyoLabel className="mb-2">{t('common.environment').toUpperCase()}</DyoLabel>

                  <KeyValueInput
                    className="max-h-128 overflow-y-auto"
                    onChange={it => onPatch({ environment: it })}
                    items={item.environment}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                <div className="flex flex-row justify-between">
                  <DyoToggle
                    checked={item.useParentConfig}
                    onCheckedChange={it => onPatch({ useParentConfig: it })}
                    disabled={disabled}
                    label={t('common.useParent').toLocaleUpperCase()}
                  />

                  {removeButton()}
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}

export default CommonConfigSection
