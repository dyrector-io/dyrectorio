import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  CreatePipelineEventWatcher,
  PIPELINE_TRIGGER_EVENT_VALUES,
  PipelineDetails,
  PipelineEventWatcher,
  Registry,
  UpdatePipelineEventWatcher,
} from '@app/models'
import { fetcher, sendForm } from '@app/utils'
import { upsertEventWatcherSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import { OFFLINE_EDITOR_STATE } from '../editor/use-item-editor-state'
import KeyValueInput from '../shared/key-value-input'

type EditEventWatcherCardProps = {
  className?: string
  pipeline: PipelineDetails
  eventWatcher: PipelineEventWatcher
  onEventWatcherEdited: (eventWatcher: PipelineEventWatcher) => void
  onDiscard: VoidFunction
}

const EditEventWatcherCard = (props: EditEventWatcherCardProps) => {
  const { className, pipeline, eventWatcher, onEventWatcherEdited, onDiscard } = props

  const { t } = useTranslation('pipelines')

  const routes = useTeamRoutes()

  const handleApiError = defaultApiErrorHandler(t)

  const editing = !!eventWatcher.id

  const formik = useDyoFormik<CreatePipelineEventWatcher | UpdatePipelineEventWatcher>({
    initialValues: {
      ...eventWatcher,
      registryId: eventWatcher.registry?.id ?? null,
    },
    validationSchema: upsertEventWatcherSchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const body: CreatePipelineEventWatcher | UpdatePipelineEventWatcher = {
        ...values,
      }

      const res = !editing
        ? await sendForm('POST', routes.pipeline.api.eventWatchers(pipeline.id), body)
        : await sendForm('PUT', routes.pipeline.api.eventWatcherDetails(pipeline.id, eventWatcher.id), body)

      if (res.ok) {
        const result =
          res.status === 201
            ? ((await res.json()) as PipelineEventWatcher)
            : {
                ...eventWatcher,
                ...values,
              }

        onEventWatcherEdited(result)
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  const { data: fetchedRegistries, error: fetchRegistriesError } = useSWR<Registry[]>(
    routes.registry.api.list(),
    fetcher,
  )

  const registries = fetchedRegistries?.filter(it => it.type === 'v2')

  useEffect(() => {
    if (registries && registries.length < 1) {
      toast.error(t('needV2Registry'))
    }
    if (registries?.length === 1 && !formik.values.registryId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formik.setFieldValue('registryId', registries[0].id)
    }
  }, [registries, t, formik])

  return (
    <DyoCard className={className}>
      <div className="flex flex-row">
        <DyoHeading element="h4" className="text-lg text-bright">
          {editing ? t('common:editName', { name: eventWatcher.name }) : t('newEventWatcher')}
        </DyoHeading>

        <DyoButton outlined secondary className="ml-auto mr-2 px-10" onClick={onDiscard}>
          {t('common:discard')}
        </DyoButton>

        <DyoButton outlined className="ml-2 px-10" onClick={() => formik.submitForm()}>
          {editing ? t('common:save') : t('common:add')}
        </DyoButton>
      </div>

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          type="name"
          required
          label={t('common:name')}
          onChange={formik.handleChange}
          value={formik.values.name}
          message={formik.errors.name}
        />

        <DyoLabel textColor="mt-8 mb-2.5 text-light-eased">{t('common:event')}</DyoLabel>

        <DyoChips
          className="text-bright"
          name="event"
          choices={PIPELINE_TRIGGER_EVENT_VALUES}
          selection={formik.values.event}
          converter={it => t(`triggerEvents.${it}`)}
          onSelectionChange={async (it): Promise<void> => {
            await formik.setFieldValue('event', it, false)
          }}
          qaLabel={chipsQALabelFromValue}
        />

        {fetchRegistriesError ? (
          <DyoLabel>
            {t('errors:fetchFailed', {
              type: t('common:registries'),
            })}
          </DyoLabel>
        ) : !registries ? (
          <DyoLabel>{t('common:loading')}</DyoLabel>
        ) : (
          <div className="flex flex-col">
            <DyoLabel className="mt-8 mb-2.5">{t('common:registries')}</DyoLabel>

            <DyoChips
              name="registries"
              choices={registries ?? []}
              converter={(it: Registry) => it.name}
              selection={registries.find(it => it.id === formik.values.registryId)}
              onSelectionChange={it => formik.setFieldValue('registryId', it.id)}
            />
            {formik.errors.registryId && <DyoMessage message={formik.errors.registryId} messageType="error" />}
          </div>
        )}

        <DyoInput
          className="max-w-lg"
          grow
          name="filters.imageNameStartsWith"
          type="text"
          required
          label={t('filters.imageNameStartsWith')}
          onChange={formik.handleChange}
          value={formik.values.filters.imageNameStartsWith}
          message={formik.errors.filters?.imageNameStartsWith}
        />

        <div className="mt-6">
          <DyoLabel>{t('inputs')}</DyoLabel>

          <DyoMessage className="text-xs mt-2" message={t('templateTips')} messageType="info" />

          <KeyValueInput
            items={formik.values.triggerInputs}
            onChange={async it => {
              await formik.setFieldValue('triggerInputs', it)
            }}
            editorOptions={OFFLINE_EDITOR_STATE}
          />
        </div>

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditEventWatcherCard
