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
  ConcreteContainerConfigData,
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
    let patch: ConcreteContainerConfigData = {
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

      <div className="flex flex-col gap-8 border-2 rounded-lg rounded-tl-[0px] border-solid border-dyo-orange/50 p-8 w-full">
        <div className="flex flex-col gap-2">
          {/* args */}
          {filterContains('args', selectedFilters) && (
            <div>
              <KeyOnlyInput
                keyPlaceholder={t('common.arguments')}
                label={t('common.arguments').toUpperCase()}
                labelClassName="text-bright font-semibold tracking-wide"
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

        {/* commands */}
        {filterContains('commands', selectedFilters) && (
          <div>
            <KeyOnlyInput
              keyPlaceholder={t('common.commands')}
              label={t('common.commands').toUpperCase()}
              labelClassName="text-bright font-semibold tracking-wide"
              onChange={it => onChange({ commands: it })}
              onResetSection={resettableConfig.commands ? () => onResetSection('commands') : null}
              items={config.commands}
              editorOptions={editorOptions}
              disabled={disabled}
            />
            <DyoMessage message={findErrorFor(fieldErrors, 'commands')} messageType="error" />
          </div>
        )}

        {/* configContainer */}
        {filterContains('configContainer', selectedFilters) && (
          <div>
            <ConfigSectionLabel
              disabled={disabled || !resettableConfig.configContainer}
              onResetSection={() => onResetSection('configContainer')}
              error={conflictErrors?.configContainer}
              className="mb-1"
            >
              {t('common.configContainer').toUpperCase()}
            </ConfigSectionLabel>

            <div className="flex flex-col gap-4 ml-2">
              <MultiInput
                id="common.configContainer.image"
                label={t('common.image')}
                labelClassName="my-auto mr-4 w-20"
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
                labelClassName="my-auto mr-4 w-20"
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
                labelClassName="my-auto mr-4 w-20"
                grow
                inline
                value={config.configContainer?.path ?? ''}
                onPatch={it => onChange({ configContainer: { ...config.configContainer, path: it } })}
                editorOptions={editorOptions}
                message={findErrorFor(fieldErrors, 'configContainer.path')}
                disabled={disabled}
              />

              <DyoToggle
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

        {/* name */}
        {filterContains('name', selectedFilters) && (
          <div className="flex flex-col">
            <ConfigSectionLabel
              className="mb-1"
              disabled={disabled || !stringResettable(baseConfig?.name, resettableConfig.name)}
              onResetSection={() => onResetSection('name')}
            >
              {t('common.name').toUpperCase()}
            </ConfigSectionLabel>

            <MultiInput
              id="common.name"
              labelClassName="text-bright font-semibold tracking-wide mb-2 my-auto mr-4"
              grow
              value={config.name ?? ''}
              placeholder={t('common.name')}
              onPatch={it => onChange({ name: it })}
              editorOptions={editorOptions}
              message={findErrorFor(fieldErrors, 'name') ?? conflictErrors?.name}
              disabled={disabled}
            />
          </div>
        )}

        {/* environment */}
        {filterContains('environment', selectedFilters) && (
          <KeyValueInput
            labelClassName="text-bright font-semibold tracking-wide mb-1"
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
        )}

        {/* expose */}
        {filterContains('expose', selectedFilters) && (
          <div>
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
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-4">
                  <MultiInput
                    id={`common.initContainers-${item.id}-name`}
                    label={t('common:name')}
                    labelClassName="my-auto mr-2 w-24"
                    grow
                    inline
                    value={item.name ?? ''}
                    onPatch={it => onPatch({ name: it })}
                    editorOptions={editorOptions}
                    disabled={disabled}
                    invalid={matchError(error, 'name')}
                  />

                  {removeButton()}
                </div>

                <MultiInput
                  id={`common.initContainers-${item.id}-image`}
                  label={t('common.image')}
                  labelClassName="my-auto mr-2 w-20"
                  grow
                  inline
                  value={item.image ?? ''}
                  onPatch={it => onPatch({ image: it })}
                  editorOptions={editorOptions}
                  disabled={disabled}
                  invalid={matchError(error, 'image')}
                />

                <div className="flex flex-col gap-1">
                  <DyoLabel className="font-semibold">{t('common.volumes')}</DyoLabel>

                  <KeyValueInput
                    keyPlaceholder={t('common:name')}
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

                <div className="flex flex-col gap-2">
                  <DyoLabel className="font-semibold">{t('common.arguments')}</DyoLabel>

                  <KeyOnlyInput
                    keyPlaceholder={t('common.arguments')}
                    onChange={it => onPatch({ args: it })}
                    items={item.args}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <DyoLabel className="font-semibold">{t('common.command')}</DyoLabel>

                  <KeyOnlyInput
                    keyPlaceholder={t('common.command')}
                    onChange={it => onPatch({ command: it })}
                    items={item.command}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <DyoLabel className="font-semibold">{t('common.environment')}</DyoLabel>

                  <KeyValueInput
                    onChange={it => onPatch({ environment: it })}
                    items={item.environment}
                    editorOptions={editorOptions}
                    disabled={disabled}
                  />
                </div>

                <DyoToggle
                  checked={item.useParentConfig}
                  onCheckedChange={it => onPatch({ useParentConfig: it })}
                  disabled={disabled}
                  label={t('common.useParent')}
                />
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
            findErrorMessage={index => findErrorStartsWith(fieldErrors, `portRanges[${index}]`)}
            onPatch={it => onChange({ portRanges: it })}
            onResetSection={resettableConfig.portRanges ? () => onResetSection('portRanges') : null}
            renderItem={(item, error, removeButton, onPatch) => (
              <>
                <div className="flex flex-row gap-16 mx-2">
                  <div className="flex flex-row gap-4">
                    <DyoLabel className="my-auto">{t('common.internal')}</DyoLabel>

                    <MultiInput
                      id={`common.portRanges-${item.id}-internal.from`}
                      containerClassName="w-40"
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
                      containerClassName="w-40"
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

                  <div className="flex flex-row gap-2">
                    <DyoLabel className="my-auto">{t('common.external')}</DyoLabel>
                    <MultiInput
                      id={`common.portRanges-${item.id}-external.from`}
                      containerClassName="w-40"
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
                      containerClassName="w-40"
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

        {/* routing */}
        {filterContains('routing', selectedFilters) && (
          <div>
            <ConfigSectionLabel
              disabled={disabled || !resettableConfig.routing}
              onResetSection={() => onResetSection('routing')}
              error={conflictErrors?.routing}
            >
              {t('common.routing').toUpperCase()}
            </ConfigSectionLabel>

            <div className="flex flex-col gap-4 ml-2">
              <MultiInput
                id="routing.domain"
                label={t('common.domain')}
                labelClassName="my-auto mr-4 w-32"
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
                labelClassName="my-auto mr-4 w-32"
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
                className="my-1"
                labelClassName="text-light-eased mr-14"
                name="routing.stripPath"
                checked={config.routing?.stripPath ?? false}
                onCheckedChange={it => onChange({ routing: { ...config.routing, stripPath: it } })}
                disabled={disabled}
                label={t('common.stripPath')}
              />

              <MultiInput
                id="routing.uploadLimit"
                label={t('common.uploadLimit')}
                labelClassName="my-auto mr-4 w-32"
                grow
                inline
                value={config.routing?.uploadLimit ?? ''}
                placeholder={t('common.uploadLimit')}
                onPatch={it => onChange({ routing: { ...config.routing, uploadLimit: it } })}
                editorOptions={editorOptions}
                disabled={disabled}
              />
              <div className="max-w-lg mb-3 flex flex-row">
                <DyoLabel className="my-auto w-32 whitespace-nowrap text-light-eased">{t('common.port')}</DyoLabel>

                {exposedPorts.length > 0 ? (
                  <DyoChips
                    className="w-full ml-10"
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
                    className="text-xs italic ml-2"
                    grow
                    messageType="info"
                    message={t('common.noInternalPortsDefined')}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* secrets */}
        {filterContains('secrets', selectedFilters) && (
          <div>
            {sectionType === 'concrete' ? (
              <SecretKeyValueInput
                keyPlaceholder={t('common.secrets')}
                labelClassName="text-bright font-semibold tracking-wide"
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
                keyPlaceholder={t('common.secrets')}
                labelClassName="text-bright font-semibold tracking-wide mb-3"
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

        {/* storage */}
        {filterContains('storage', selectedFilters) && (
          <div>
            <ConfigSectionLabel
              disabled={disabled || !resettableConfig.storage}
              onResetSection={() => onResetSection('storage')}
              error={conflictErrors?.storage}
            >
              {t('common.storage').toUpperCase()}
            </ConfigSectionLabel>

            <div className="flex flex-col gap-4 ml-2">
              <div className="flex flex-row">
                <DyoLabel className="my-auto w-32 whitespace-nowrap text-light-eased">{t('common.storage')}</DyoLabel>

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
                labelClassName="my-auto mr-2 w-32"
                grow
                inline
                value={config.storage?.bucket ?? ''}
                placeholder={t('common.bucketPath')}
                onPatch={it => onChange({ storage: { ...config.storage, bucket: it } })}
                editorOptions={editorOptions}
                disabled={disabled || !resettableConfig.storage?.storageId}
                message={findErrorFor(fieldErrors, 'storage.bucket')}
              />

              <div className="flex flex-row">
                <DyoLabel className="my-auto w-32 whitespace-nowrap text-light-eased">{t('common.volume')}</DyoLabel>

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
              <DyoMessage grow message={findErrorFor(fieldErrors, 'storage.path')} />

              <DyoLabel textColor="text-light">{t('common.buketPathTips')}</DyoLabel>
            </div>
          </div>
        )}

        {/* tty */}
        {filterContains('tty', selectedFilters) && (
          <div className="flex flex-row">
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

        {/* user */}
        {filterContains('user', selectedFilters) && (
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
              labelClassName="text-bright font-semibold tracking-wide mr-4"
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
        )}

        {/* volumes */}
        {filterContains('volumes', selectedFilters) && (
          <ExtendableItemList
            disabled={disabled}
            items={config.volumes}
            label={t('common.volumes')}
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-4">
                      <MultiInput
                        id={`common.volumes-${item.id}-name`}
                        label={t('common:name')}
                        labelClassName="my-auto w-28 mr-2"
                        inline
                        value={item.name ?? ''}
                        onPatch={it => onPatch({ name: it })}
                        editorOptions={editorOptions}
                        disabled={disabled}
                        invalid={matchError(error, 'name')}
                      />

                      {removeButton('self-center')}
                    </div>

                    <MultiInput
                      id={`common.volumes-${item.id}-size`}
                      label={t('common.size')}
                      labelClassName="my-auto w-32"
                      grow
                      inline
                      value={item.size ?? ''}
                      onPatch={it => onPatch({ size: it })}
                      editorOptions={editorOptions}
                      disabled={disabled}
                      invalid={matchError(error, 'size')}
                    />

                    <MultiInput
                      id={`common.volumes-${item.id}-path`}
                      label={t('common.path')}
                      labelClassName="my-auto w-32"
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
                      labelClassName="my-auto w-32"
                      grow
                      inline
                      value={item.class ?? ''}
                      onPatch={it => onPatch({ class: it })}
                      editorOptions={editorOptions}
                      disabled={disabled}
                      invalid={matchError(error, 'class')}
                    />
                  </div>

                  <div className="flex flex-row gap-4">
                    <DyoLabel className="my-auto mr-16">{t('common.type')}</DyoLabel>

                    <DyoChips
                      name="volumeType"
                      choices={CONTAINER_VOLUME_TYPE_VALUES}
                      selection={item.type}
                      converter={(it: VolumeType) => t(`common.volumeTypes.${it}`)}
                      onSelectionChange={it => onPatch({ type: it })}
                      disabled={disabled}
                      qaLabel={chipsQALabelFromValue}
                    />
                  </div>
                </div>

                {(conflictErrors?.volumes ?? {})[item.path] && (
                  <DyoMessage message={conflictErrors?.volumes[item.path]} messageType="error" />
                )}
              </>
            )}
          />
        )}

        {/* working directory */}
        {filterContains('workingDirectory', selectedFilters) && (
          <div className="flex flex-row gap-4 items-center">
            <ConfigSectionLabel
              className="mt-2"
              disabled={disabled || !stringResettable(baseConfig?.workingDirectory, resettableConfig.workingDirectory)}
              onResetSection={() => onResetSection('workingDirectory')}
            >
              {t('common.workingDirectory').toUpperCase()}
            </ConfigSectionLabel>

            <MultiInput
              id="common.workingDirectory"
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
        )}
      </div>
    </div>
  )
}

export default CommonConfigSection
