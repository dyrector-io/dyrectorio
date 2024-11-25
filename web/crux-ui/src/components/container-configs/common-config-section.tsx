import MultiInput from '@app/components/editor/multi-input'
import { ItemEditorState } from '@app/components/editor/use-item-editor-state'
import KeyOnlyInput from '@app/components/shared/key-only-input'
import KeyValueInput from '@app/components/shared/key-value-input'
import SecretKeyInput from '@app/components/shared/secret-key-input'
import SecretKeyValueInput from '@app/components/shared/secret-key-value-input'
import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoToggle from '@app/elements/dyo-toggle'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  COMMON_CONFIG_KEYS,
  CONTAINER_EXPOSE_STRATEGY_VALUES,
  CONTAINER_VOLUME_TYPE_VALUES,
  CommonConfigKey,
  ConcreteCommonConfigData,
  ConcreteContainerConfigData,
  ConcreteCraneConfigData,
  ContainerConfigData,
  ContainerConfigErrors,
  ContainerConfigExposeStrategy,
  ContainerConfigKey,
  ContainerConfigSectionType,
  InitContainerVolumeLink,
  Port,
  StorageOption,
  UniqueSecretKeyValue,
  Volume,
  VolumeType,
  booleanResettable,
  filterContains,
  filterEmpty,
  numberResettable,
  portRangeToString,
  stringResettable,
} from '@app/models'
import { fetcher, toNumber } from '@app/utils'
import {
  ContainerConfigValidationErrors,
  findErrorFor,
  findErrorStartsWith,
  getValidationError,
  matchError,
  unsafeUniqueKeyValuesSchema,
} from '@app/validations'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import useSWR from 'swr'
import { v4 as uuid } from 'uuid'
import ConfigSectionLabel from './config-section-label'
import ExtendableItemList from './extendable-item-list'

type CommonConfigSectionProps = {
  disabled?: boolean
  selectedFilters: ContainerConfigKey[]
  editorOptions: ItemEditorState
  resettableConfig: ContainerConfigData | ConcreteContainerConfigData
  config: ContainerConfigData | ConcreteContainerConfigData
  onChange: (config: ContainerConfigData | ConcreteContainerConfigData) => void
  onResetSection: (section: CommonConfigKey) => void
  fieldErrors: ContainerConfigValidationErrors
  conflictErrors: ContainerConfigErrors
  definedSecrets?: string[]
  publicKey?: string
  baseConfig: ContainerConfigData | null
}

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
    conflictErrors,
    definedSecrets,
    publicKey,
    resettableConfig,
    config,
    baseConfig,
  } = props

  const { data: storages } = useSWR<StorageOption[]>(routes.storage.api.options(), fetcher)

  const sectionType: ContainerConfigSectionType = baseConfig ? 'concrete' : 'base'

  const exposedPorts = config.ports?.filter(it => !!it.internal) ?? []

  const onVolumesChanged = (it: Volume[]) =>
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

  const onPortsChanged = (ports: Port[]) => {
    let patch: Partial<ConcreteCommonConfigData & Pick<ConcreteCraneConfigData, 'metrics'>> = {
      ports,
    }

    if (config.metrics) {
      const metricsPort = ports.find(it => it.internal === config.metrics.port)
      patch = {
        ...patch,
        metrics: {
          ...config.metrics,
          port: metricsPort?.internal ?? null,
        },
      }
    }

    if (config.routing) {
      const routingPort = ports.find(it => it.internal === config.routing.port)
      patch = {
        ...patch,
        routing: {
          ...config.routing,
          port: routingPort?.internal ?? null,
        },
      }
    }
    onChange(patch)
  }

  const environmentWarning =
    getValidationError(unsafeUniqueKeyValuesSchema, config.environment, undefined, t)?.message ?? null

  return !filterEmpty([...COMMON_CONFIG_KEYS], selectedFilters) ? null : (
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
                  disabled={disabled || !stringResettable(baseConfig?.name, resettableConfig.name)}
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
                  message={findErrorFor(fieldErrors, 'name') ?? conflictErrors?.name}
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
                  disabled={disabled || !numberResettable(baseConfig?.user, resettableConfig.user)}
                  onResetSection={() => onResetSection('user')}
                >
                  {t('common.user').toUpperCase()}
                </ConfigSectionLabel>

                <MultiInput
                  id="common.user"
                  containerClassName="max-w-lg mb-3"
                  labelClassName="text-bright font-semibold tracking-wide mb-2 my-auto mr-4"
                  grow
                  value={config.user !== -1 ? config.user : ''}
                  placeholder={t('common.placeholders.containerDefault')}
                  onPatch={it => {
                    const val = toNumber(it)
                    onChange({ user: typeof val !== 'number' ? -1 : val })
                  }}
                  editorOptions={editorOptions}
                  message={findErrorFor(fieldErrors, 'user') ?? conflictErrors?.user}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {/* working directory */}
          {filterContains('workingDirectory', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8">
              <div className="flex flex-row gap-4 items-start">
                <ConfigSectionLabel
                  disabled={
                    disabled || !stringResettable(baseConfig?.workingDirectory, resettableConfig.workingDirectory)
                  }
                  onResetSection={() => onResetSection('workingDirectory')}
                >
                  {t('common.workingDirectory').toUpperCase()}
                </ConfigSectionLabel>

                <MultiInput
                  id="common.workingDirectory"
                  containerClassName="max-w-lg mb-3"
                  labelClassName="text-bright font-semibold tracking-wide mb-2 my-auto mr-4"
                  grow
                  value={config.workingDirectory ?? ''}
                  placeholder={t('common.placeholders.containerDefault')}
                  onPatch={it => onChange({ workingDirectory: it })}
                  editorOptions={editorOptions}
                  message={findErrorFor(fieldErrors, 'workingDirectory') ?? conflictErrors?.workingDirectory}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {/* expose */}
          {filterContains('expose', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8">
              <ConfigSectionLabel
                disabled={disabled || !stringResettable(baseConfig?.expose, resettableConfig.expose)}
                onResetSection={() => onResetSection('expose')}
                error={conflictErrors?.expose}
              >
                {t('common.exposeStrategy').toUpperCase()}
              </ConfigSectionLabel>

              <DyoChips
                className="ml-2"
                name="exposeStrategy"
                choices={CONTAINER_EXPOSE_STRATEGY_VALUES}
                selection={config.expose}
                converter={(it: ContainerConfigExposeStrategy) => t(`common.exposeStrategies.${it}`)}
                onSelectionChange={it => onChange({ expose: it })}
                disabled={disabled}
                qaLabel={chipsQALabelFromValue}
              />
            </div>
          )}

          {/* tty */}
          {filterContains('tty', selectedFilters) && (
            <div className="flex flex-row break-inside-avoid mb-8">
              <ConfigSectionLabel
                disabled={disabled || !booleanResettable(baseConfig?.tty, resettableConfig.tty)}
                onResetSection={() => onResetSection('tty')}
                error={conflictErrors?.tty}
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
                disabled={disabled || !resettableConfig.configContainer}
                onResetSection={() => onResetSection('configContainer')}
                error={conflictErrors?.configContainer}
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
                  message={findErrorFor(fieldErrors, 'configContainer.image')}
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
                  message={findErrorFor(fieldErrors, 'configContainer.volume')}
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
                  message={findErrorFor(fieldErrors, 'configContainer.path')}
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
                disabled={disabled || !resettableConfig.routing}
                onResetSection={() => onResetSection('routing')}
                error={conflictErrors?.routing}
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
                  message={findErrorFor(fieldErrors, 'routing.domain')}
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
                  message={findErrorFor(fieldErrors, 'routing.path')}
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
                <div className="max-w-lg mb-3 flex flex-row">
                  <DyoLabel className="my-auto w-40 whitespace-nowrap text-light-eased">{t('common.port')}</DyoLabel>

                  {exposedPorts.length > 0 ? (
                    <DyoChips
                      className="w-full ml-2"
                      name="exposedPorts"
                      choices={[null, ...exposedPorts.map(it => it.internal)]}
                      selection={config.routing?.port ?? null}
                      converter={(it: number | null) => it?.toString() ?? t('common.default')}
                      onSelectionChange={it =>
                        onChange({
                          routing: {
                            ...config.routing,
                            port: it,
                          },
                        })
                      }
                      disabled={disabled}
                    />
                  ) : (
                    <DyoMessage
                      className="w-full ml-2"
                      messageType="info"
                      message={t('common.noInternalPortsDefined')}
                    />
                  )}
                </div>
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
                onResetSection={resettableConfig.environment ? () => onResetSection('environment') : null}
                items={config.environment}
                editorOptions={editorOptions}
                disabled={disabled}
                findErrorMessage={index => findErrorStartsWith(fieldErrors, `environment[${index}]`)}
                message={findErrorFor(fieldErrors, `environment`) ?? environmentWarning}
                messageType={!findErrorFor(fieldErrors, `environment`) && environmentWarning ? 'info' : 'error'}
                errors={conflictErrors?.environment}
              />
            </div>
          )}

          {/* secrets */}
          {filterContains('secrets', selectedFilters) && (
            <div className="grid break-inside-avoid mb-8 max-w-lg">
              {sectionType === 'concrete' ? (
                <SecretKeyValueInput
                  className="max-h-128 overflow-y-auto mb-2"
                  keyPlaceholder={t('common.secrets').toUpperCase()}
                  labelClassName="text-bright font-semibold tracking-wide mb-2"
                  label={t('common.secrets').toUpperCase()}
                  onSubmit={it => onChange({ secrets: it })}
                  items={config.secrets as UniqueSecretKeyValue[]}
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
                  onResetSection={resettableConfig.secrets ? () => onResetSection('secrets') : null}
                  items={config.secrets}
                  editorOptions={editorOptions}
                  disabled={disabled}
                />
              )}
              <DyoMessage message={findErrorFor(fieldErrors, 'secrets')} messageType="error" />
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
                onResetSection={resettableConfig.commands ? () => onResetSection('commands') : null}
                items={config.commands}
                editorOptions={editorOptions}
                disabled={disabled}
              />
              <DyoMessage message={findErrorFor(fieldErrors, 'commands')} messageType="error" />
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
                onResetSection={resettableConfig.args ? () => onResetSection('args') : null}
                items={config.args}
                editorOptions={editorOptions}
                disabled={disabled}
              />
              <DyoMessage message={findErrorFor(fieldErrors, 'args')} messageType="error" />
            </div>
          )}
        </div>

        {/* storage */}
        {filterContains('storage', selectedFilters) && (
          <div className="grid mb-8 break-inside-avoid">
            <ConfigSectionLabel
              disabled={disabled || !resettableConfig.storage}
              onResetSection={() => onResetSection('storage')}
              error={conflictErrors?.storage}
            >
              {t('common.storage').toUpperCase()}
            </ConfigSectionLabel>

            <div className="ml-2">
              <div className="max-w-lg mb-3 flex flex-row">
                <DyoLabel className="my-auto w-40 whitespace-nowrap text-light-eased">{t('common.storage')}</DyoLabel>

                <DyoChips
                  className="w-full ml-2"
                  name="storages"
                  choices={storages ? [null, ...storages.map(it => it.id)] : [null]}
                  selection={config.storage?.storageId ?? null}
                  converter={(it: string) => storages?.find(storage => storage.id === it)?.name ?? t('common:none')}
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
                disabled={disabled || !resettableConfig.storage?.storageId}
                message={findErrorFor(fieldErrors, 'storage.bucket')}
              />

              <div className="max-w-lg mb-3 flex flex-row">
                <DyoLabel className="my-auto w-40 whitespace-nowrap text-light-eased">{t('common.volume')}</DyoLabel>

                <DyoChips
                  className={clsx('w-full ml-2', disabled || !config.storage?.storageId ? 'opacity-50' : null)}
                  name="volumes"
                  choices={config.volumes ? [null, ...config.volumes.filter(it => it.name).map(it => it.name)] : [null]}
                  selection={config.storage?.path ?? null}
                  converter={(it: string) =>
                    config.volumes?.find(volume => volume.name === it)?.name ?? t('common:none')
                  }
                  onSelectionChange={it =>
                    onChange({
                      storage: { ...config.storage, path: it },
                    })
                  }
                  disabled={disabled || !resettableConfig.storage?.storageId}
                />
              </div>
              <DyoMessage
                message={findErrorFor(fieldErrors, 'storage.path')}
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
            onPatch={it => onPortsChanged(it)}
            onResetSection={resettableConfig.ports ? () => onResetSection('ports') : null}
            findErrorMessage={index => findErrorStartsWith(fieldErrors, `ports[${index}]`)}
            emptyItemFactory={() => ({
              external: null,
              internal: null,
            })}
            renderItem={(item, error, removeButton, onPatch) => (
              <>
                <div className="flex flex-row flex-grow">
                  <div className="w-6/12 ml-2">
                    <MultiInput
                      id={`common.ports-${item.id}-external`}
                      className="w-full mr-2"
                      grow
                      placeholder={t('common.external')}
                      value={item.external ?? ''}
                      type="number"
                      invalid={matchError(error, 'external')}
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
                      invalid={matchError(error, 'internal')}
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

                {(conflictErrors?.ports ?? {})[item.internal] && (
                  <DyoMessage message={conflictErrors?.ports[item.internal]} messageType="error" />
                )}
              </>
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
            findErrorMessage={index => findErrorStartsWith(fieldErrors, `portRanges[${index}]`)}
            onPatch={it => onChange({ portRanges: it })}
            onResetSection={resettableConfig.portRanges ? () => onResetSection('portRanges') : null}
            renderItem={(item, error, removeButton, onPatch) => (
              <>
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
                      invalid={matchError(error, 'internal.from')}
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
                      invalid={matchError(error, 'internal.to')}
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
                      invalid={matchError(error, 'external.from')}
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
                      invalid={matchError(error, 'external.from')}
                    />

                    {removeButton()}
                  </div>
                </div>

                {(conflictErrors?.portRanges ?? {})[portRangeToString(item.internal)] && (
                  <DyoMessage
                    message={conflictErrors?.portRanges[portRangeToString(item.internal)]}
                    messageType="error"
                  />
                )}
              </>
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
            findErrorMessage={index => findErrorStartsWith(fieldErrors, `volumes[${index}]`)}
            onPatch={it => onVolumesChanged(it)}
            onResetSection={resettableConfig.volumes ? () => onResetSection('volumes') : null}
            renderItem={(item, error, removeButton, onPatch) => (
              <>
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
                      invalid={matchError(error, 'name')}
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
                      invalid={matchError(error, 'size')}
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
                      invalid={matchError(error, 'path')}
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
                      invalid={matchError(error, 'class')}
                    />
                  </div>

                  <div className="flex flex-row justify-between">
                    <div className="flex flex-col flex-grow">
                      <DyoLabel className="my-auto mr-4">{t('common.type')}</DyoLabel>

                      <div className="flex flex-row">
                        <DyoChips
                          name="volumeType"
                          choices={CONTAINER_VOLUME_TYPE_VALUES}
                          selection={item.type}
                          converter={(it: VolumeType) => t(`common.volumeTypes.${it}`)}
                          onSelectionChange={it => onPatch({ type: it })}
                          disabled={disabled}
                          qaLabel={chipsQALabelFromValue}
                        />

                        {removeButton('self-center ml-auto')}
                      </div>
                    </div>
                  </div>
                </div>

                {(conflictErrors?.volumes ?? {})[item.path] && (
                  <DyoMessage message={conflictErrors?.volumes[item.path]} messageType="error" />
                )}
              </>
            )}
          />
        )}

        {/* initContainers */}
        {filterContains('initContainers', selectedFilters) && (
          <ExtendableItemList
            disabled={disabled}
            items={config.initContainers}
            label={t('common.initContainers')}
            error={conflictErrors?.initContainers}
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
            findErrorMessage={index => findErrorStartsWith(fieldErrors, `initContainers[${index}]`)}
            onPatch={it => onChange({ initContainers: it })}
            onResetSection={resettableConfig.initContainers ? () => onResetSection('initContainers') : null}
            renderItem={(item, error, removeButton, onPatch) => (
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
                  invalid={matchError(error, 'name')}
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
                  invalid={matchError(error, 'image')}
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
