import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import { defaultApiErrorHandler } from '@app/errors'
import { CreateDeployment, DeploymentCreated, DyoNode } from '@app/models'
import { API_NODES, versionDeploymentsApiUrl } from '@app/routes'
import { fetcher, sendForm } from '@app/utils'
import { createDeploymentSchema } from '@app/validation'
import { DyoApiError } from '@server/error-middleware'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import useSWR from 'swr'

interface AddDeploymentCardProps {
  className?: string
  productId: string
  versionId: string
  onAdd: (deploymentId: string) => void
  onDiscard: VoidFunction
}

const AddDeploymentCard = (props: AddDeploymentCardProps) => {
  const { productId, versionId } = props

  const { t } = useTranslation('versions')

  const { data: nodes, error: fetchNodesError } = useSWR<DyoNode[]>(API_NODES, fetcher)

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    validationSchema: createDeploymentSchema,
    initialValues: {
      nodeId: null as string,
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateDeployment = {
        ...values,
      }

      const res = await sendForm('POST', versionDeploymentsApiUrl(productId, versionId), body)

      if (res.ok) {
        let result = (await res.json()) as DeploymentCreated
        props.onAdd(result.id)
      } else if (res.status === 409) {
        // There is already a deployment for the selected node
        const dto = (await res.json()) as DyoApiError
        props.onAdd(dto.value)
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

  return (
    <DyoCard className={props.className}>
      <div className="flex flex-row">
        <DyoHeading element="h4" className="text-lg text-bright">
          {t('addDeployment')}
        </DyoHeading>

        <DyoButton outlined secondary className="ml-auto mr-2 px-10" onClick={props.onDiscard}>
          {t('common:discard')}
        </DyoButton>

        {!formik.values.nodeId ? null : (
          <DyoButton outlined className="ml-2 px-10" onClick={() => formik.submitForm()}>
            {t('common:add')}
          </DyoButton>
        )}
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
          <div className="flex flex-wrap mt-4">
            <DyoLabel className="ml-8 mr-2 my-auto">{t('common:nodes')}</DyoLabel>

            <DyoChips
              choices={nodes}
              converter={(it: DyoNode) => it.name}
              onSelectionChange={it => formik.setFieldValue('nodeId', it.id)}
            />
          </div>
        </div>
      )}
    </DyoCard>
  )
}

export default AddDeploymentCard
