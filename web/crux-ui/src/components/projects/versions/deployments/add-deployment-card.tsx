import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoTextArea from '@app/elements/dyo-text-area'
import { apiErrorHandler, defaultTranslator } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { CreateDeployment, Deployment, DyoApiError, DyoNode, projectNameToDeploymentPrefix } from '@app/models'
import { API_DEPLOYMENTS, API_NODES } from '@app/routes'
import { fetcher, sendForm } from '@app/utils'
import { createDeploymentSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

interface AddDeploymentCardProps {
  className?: string
  projectName: string
  versionId: string
  onAdd: (deploymentId: string) => void
  onDiscard: VoidFunction
}

const AddDeploymentCard = (props: AddDeploymentCardProps) => {
  const { projectName, versionId, className, onAdd, onDiscard } = props

  const { t } = useTranslation('deployments')

  const { data: nodes, error: fetchNodesError } = useSWR<DyoNode[]>(API_NODES, fetcher)

  const handleApiError = apiErrorHandler((stringId: string, status: number, dto: DyoApiError) => {
    onAdd(dto.value)

    if (dto.error === 'rollingVersionDeployment' || dto.error === 'alreadyHavePreparing') {
      return {
        toast: dto.description,
        toastOptions: {
          className: '!bg-warning-orange',
          duration: 5000,
        },
      }
    }

    return defaultTranslator(t)(stringId, status, dto)
  })

  const formik = useDyoFormik({
    initialValues: {
      nodeId: null as string,
      note: '',
      prefix: projectNameToDeploymentPrefix(projectName),
    },
    validationSchema: createDeploymentSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const transformedValues = createDeploymentSchema.cast(values) as any

      const body: CreateDeployment = {
        ...transformedValues,
        versionId,
      }

      const res = await sendForm('POST', API_DEPLOYMENTS, body)

      if (res.ok) {
        const result = (await res.json()) as Deployment
        onAdd(result.id)
      } else if (res.status === 409) {
        // Handle preparing deployment exists or rolling version has deployment errors
        handleApiError(res.clone())
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

  useEffect(() => {
    if (nodes && nodes.length < 1) {
      toast.error(t('nodeRequired'))
    }
    if (nodes?.length === 1 && !formik.values.nodeId) {
      formik.setFieldValue('nodeId', nodes[0].id)
    }
  }, [nodes, t])

  return (
    <DyoCard className={className}>
      <div className="flex flex-row">
        <DyoHeading element="h4" className="text-lg text-bright">
          {t('addDeployment')}
        </DyoHeading>

        <DyoButton outlined secondary className="ml-auto mr-2 px-10" onClick={onDiscard}>
          {t('common:discard')}
        </DyoButton>

        <DyoButton outlined className="ml-2 px-10" onClick={() => formik.submitForm()}>
          {t('common:add')}
        </DyoButton>
      </div>

      {fetchNodesError ? (
        <DyoLabel>
          {t('errors:fetchFailed', {
            type: t('common:nodes'),
          })}
        </DyoLabel>
      ) : !nodes ? (
        <DyoLabel>{t('common:loading')}</DyoLabel>
      ) : (
        <div className="flex flex-col">
          <DyoLabel className="mt-8 mb-2.5">{t('common:nodes')}</DyoLabel>

          <DyoChips
            choices={nodes ?? []}
            converter={(it: DyoNode) => it.name}
            selection={nodes.find(it => it.id === formik.values.nodeId)}
            onSelectionChange={it => formik.setFieldValue('nodeId', it.id)}
          />
          {!formik.errors.nodeId ? null : <DyoMessage message={formik.errors.nodeId} messageType="error" />}

          <DyoInput
            className="max-w-lg"
            grow
            name="prefix"
            required
            label={t('common:prefix')}
            onChange={formik.handleChange}
            value={formik.values.prefix}
            message={formik.errors.prefix}
          />

          <DyoTextArea
            className="h-48"
            grow
            name="note"
            label={t('common:note')}
            onChange={formik.handleChange}
            value={formik.values.note}
          />
        </div>
      )}
    </DyoCard>
  )
}

export default AddDeploymentCard
