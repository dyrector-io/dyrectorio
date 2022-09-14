import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import { CreateDeployment, DeploymentCreated, DyoApiError, DyoNode } from '@app/models'
import { API_NODES, versionDeploymentsApiUrl } from '@app/routes'
import { fetcher, sendForm } from '@app/utils'
import { createDeploymentSchema } from '@app/validation'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

interface AddDeploymentCardProps {
  className?: string
  productId: string
  productName: string
  versionId: string
  onAdd: (deploymentId: string) => void
  onDiscard: VoidFunction
}

const AddDeploymentCard = (props: AddDeploymentCardProps) => {
  const { productId, productName, versionId, className, onAdd, onDiscard } = props

  const { t } = useTranslation('versions')

  const { data: nodes, error: fetchNodesError } = useSWR<DyoNode[]>(API_NODES, fetcher)

  useEffect(() => {
    if (nodes && nodes.length < 1) {
      toast.error(t('nodeRequired'))
    }
  }, [nodes, t])

  const handleApiError = defaultApiErrorHandler(t)

  const nameToPrefix = (name: string) => name.replaceAll(' ', '-').toLocaleLowerCase()

  const formik = useFormik({
    validationSchema: createDeploymentSchema,
    initialValues: {
      nodeId: null as string,
      note: '',
      prefix: nameToPrefix(productName),
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateDeployment = {
        ...values,
      }

      const res = await sendForm('POST', versionDeploymentsApiUrl(productId, versionId), body)

      if (res.ok) {
        const result = (await res.json()) as DeploymentCreated
        onAdd(result.id)
      } else if (res.status === 409) {
        // There is already a deployment for the selected node
        toast.error(t('alreadyHavePreparing'))
        const dto = (await res.json()) as DyoApiError
        onAdd(dto.value)
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

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
            choices={nodes}
            converter={(it: DyoNode) => it.name}
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
