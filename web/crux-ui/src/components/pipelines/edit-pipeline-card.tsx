import DyoButton from '@app/elements/dyo-button'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIconPicker from '@app/elements/dyo-icon-picker'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import DyoToggle from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CreatePipeline, PipelineDetails, PipelineType, UpdatePipeline } from '@app/models'
import { sendForm } from '@app/utils'
import { createPipelineSchema, updatePipelineSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import { OFFLINE_EDITOR_STATE } from '../editor/use-item-editor-state'
import KeyValueInput from '../shared/key-value-input'

type EditablePipeline = PipelineDetails & {
  token?: string
}

const DEFAULT_EDITABLE_PIPELINE: EditablePipeline = {
  id: null,
  name: '',
  description: '',
  icon: null,
  type: 'azure',
  repository: {
    organization: '',
    project: '',
  },
  trigger: {
    name: '',
    inputs: [],
  },
  token: '',
  audit: null,
  eventWatchers: [],
}

type EditPipelineCardProps = Omit<DyoCardProps, 'children'> & {
  pipeline?: PipelineDetails
  submit: SubmitHook
  onPipelineEdited: (pipeline: PipelineDetails) => void
}

const EditPipelineCard = (props: EditPipelineCardProps) => {
  const { pipeline: propsPipeline, onPipelineEdited, submit, ...forwardedProps } = props

  const { t } = useTranslation('pipelines')
  const routes = useTeamRoutes()

  const [pipeline, setPipeline] = useState<EditablePipeline>(
    propsPipeline
      ? {
          ...propsPipeline,
          token: null,
        }
      : DEFAULT_EDITABLE_PIPELINE,
  )

  const editing = !!pipeline.id

  const [changeToken, setChangeToken] = useState(!editing)

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    submit,
    initialValues: {
      ...pipeline,
    },
    validationSchema: !editing ? createPipelineSchema : updatePipelineSchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const body: CreatePipeline | UpdatePipeline = {
        ...values,
      }

      let request: Promise<Response> = null
      if (!editing) {
        request = sendForm('POST', routes.pipeline.api.list(), body as CreatePipeline)
      } else {
        if (!changeToken) {
          delete body.token
        }

        request = sendForm('PUT', routes.pipeline.api.details(pipeline.id), body as UpdatePipeline)
      }

      const res = await request
      if (res.ok) {
        let result: PipelineDetails
        if (res.status !== 204) {
          const json = await res.json()
          result = json as PipelineDetails
        } else {
          result = {
            ...values,
          } as PipelineDetails
        }

        setPipeline(result)
        onPipelineEdited(result)
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  const onTypeChanged = async (_: PipelineType) => {}

  const { type, trigger } = formik.values
  const { inputs } = trigger

  return (
    <DyoCard {...forwardedProps}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: pipeline.name }) : t('new')}
      </DyoHeading>

      <DyoLabel className="text-light block">{t('tips')}</DyoLabel>

      <DyoForm className="grid grid-cols-2 gap-8" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <div className="flex flex-col">
          <div className="flex flex-col mt-4">
            <DyoInput
              className="max-w-lg"
              grow
              name="name"
              type="name"
              label={t('common:name')}
              labelClassName="mr-2 mb-1 text-light-eased"
              onChange={formik.handleChange}
              value={formik.values.name}
              message={formik.errors.name}
            />
          </div>

          <div className="w-full mt-2">
            <DyoLabel>{t('common:icon')}</DyoLabel>

            <DyoIconPicker name="icon" value={formik.values.icon} setFieldValue={formik.setFieldValue} />
          </div>

          <DyoTextArea
            className="h-48"
            grow
            name="description"
            label={t('common:description')}
            onChange={formik.handleChange}
            value={formik.values.description}
          />
        </div>

        <div className="flex flex-col gap-4">
          <DyoHeading element="h5" className="text-md text-bright">
            {t('repository')}
          </DyoHeading>

          <div className="flex flex-wrap">
            <DyoLabel className="mr-2 my-auto">{t('common:type')}</DyoLabel>

            <DyoChips
              name="type"
              choices={['azure']}
              selection={formik.values.type}
              converter={(it: PipelineType) => t(`type.${it}`)}
              onSelectionChange={it => onTypeChanged(it as PipelineType)}
              qaLabel={chipsQALabelFromValue}
            />
          </div>

          {type === 'azure' && (
            <>
              <DyoInput
                className="max-w-lg"
                grow
                name="repository.organization"
                type="text"
                label={t('organization')}
                labelClassName="mr-2 mb-1 text-light-eased"
                onChange={formik.handleChange}
                value={formik.values.repository.organization}
                message={formik.errors.repository?.organization}
              />

              <DyoInput
                className="max-w-lg"
                grow
                name="repository.project"
                type="text"
                label={t('common:project')}
                labelClassName="mr-2 mb-1 text-light-eased"
                onChange={formik.handleChange}
                value={formik.values.repository.project}
                message={formik.errors.repository?.project}
              />

              {editing && (
                <DyoToggle label={t('common:changeToken')} checked={changeToken} onCheckedChange={setChangeToken} />
              )}

              {changeToken && (
                <DyoInput
                  className="max-w-lg"
                  grow
                  name="token"
                  type="password"
                  label={t('common:token')}
                  labelClassName="mr-2 mb-1 text-light-eased"
                  onChange={formik.handleChange}
                  value={formik.values.token}
                  message={formik.errors.token}
                />
              )}
            </>
          )}

          <DyoHeading element="h5" className="text-md text-bright">
            {t('trigger')}
          </DyoHeading>

          <DyoInput
            className="max-w-lg"
            grow
            name="trigger.name"
            type="text"
            label={t('pipelineName')}
            labelClassName="mr-2 mb-1 text-light-eased"
            onChange={formik.handleChange}
            value={formik.values.trigger.name}
            message={formik.errors.trigger?.name}
          />
        </div>

        <div className="col-span-2">
          <DyoLabel>{t('defaultInputs')}</DyoLabel>

          <KeyValueInput
            items={inputs}
            onChange={async it => {
              await formik.setFieldValue('trigger.inputs', it)
            }}
            editorOptions={OFFLINE_EDITOR_STATE}
          />
        </div>

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditPipelineCard
