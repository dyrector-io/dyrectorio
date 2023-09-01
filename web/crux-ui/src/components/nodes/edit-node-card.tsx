import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIconPicker from '@app/elements/dyo-icon-picker'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CreateNode, NodeDetails, UpdateNode } from '@app/models'
import { sendForm } from '@app/utils'
import { nodeSchema } from '@app/validations'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject } from 'react'

type EditNodeCardProps = {
  className?: string
  node: NodeDetails
  onNodeEdited: (node: NodeDetails, shouldClose?: boolean) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const EditNodeCard = (props: EditNodeCardProps) => {
  const { className, node, onNodeEdited, submitRef } = props

  const { t } = useTranslation('nodes')
  const routes = useTeamRoutes()

  const handleApiError = defaultApiErrorHandler(t)

  const editing = !!node.id

  const formik = useDyoFormik(
    {
      initialValues: node,
      validationSchema: nodeSchema,
      onSubmit: async (values, { setSubmitting, setFieldError }) => {
        setSubmitting(true)

        const body: CreateNode | UpdateNode = {
          ...values,
        }

        const res = await (!editing
          ? sendForm('POST', routes.node.api.list(), body as CreateNode)
          : sendForm('PUT', routes.node.api.details(node.id), body as UpdateNode))

        if (res.ok) {
          let result: NodeDetails
          if (res.status !== 204) {
            const json = await res.json()
            result = {
              ...json,
              status: node.status,
            } as NodeDetails
          } else {
            result = {
              ...values,
              id: node.id,
              status: node.status,
              type: node.type,
            } as NodeDetails
          }

          setSubmitting(false)
          onNodeEdited(result, editing)
        } else {
          setSubmitting(false)
          handleApiError(res, setFieldError)
        }
      },
    },
    submitRef,
  )

  const inputClassName = 'my-2 w-full'

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: node.name }) : t('new')}
      </DyoHeading>

      <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

      {formik.values.inUse && (
        <DyoMessage className="text-xs italic" message={t('nodeAlreadyInUse')} messageType="info" />
      )}

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          name="name"
          label={t('common:name')}
          onChange={formik.handleChange}
          value={formik.values.name}
          required
          grow
          message={formik.errors.name}
        />

        <div className={inputClassName}>
          <DyoLabel>{t('common:icon')}</DyoLabel>

          <DyoIconPicker name="icon" value={formik.values.icon} setFieldValue={formik.setFieldValue} />
        </div>

        <DyoTextArea
          className={clsx(inputClassName, 'h-48')}
          name="description"
          label={t('common:description')}
          onChange={formik.handleChange}
          value={formik.values.description}
          grow
        />

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditNodeCard
