import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { CopyDeployment, Deployment, DeploymentDetails, DyoNode } from '@app/models'
import { fetcher, sendForm } from '@app/utils'
import { copyDeploymentSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

interface CopyDeploymentCardProps {
  className?: string
  submit?: SubmitHook
  deployment: DeploymentDetails
  onDeplyomentCopied: (string) => void
  onDiscard: VoidFunction
}

const CopyDeploymentCard = (props: CopyDeploymentCardProps) => {
  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  const { className, submit, deployment, onDeplyomentCopied, onDiscard } = props

  const handleApiError = defaultApiErrorHandler(t)

  const { data: nodes, error: fetchNodesError } = useSWR<DyoNode[]>(routes.node.api.list(), fetcher)

  useEffect(() => {
    if (nodes && nodes.length < 1) {
      toast.error(t('nodeRequired'))
    }
  }, [nodes, t])

  const formik = useDyoFormik({
    submit,
    initialValues: {
      nodeId: deployment.node.id,
      prefix: deployment.version.type === 'incremental' ? deployment.prefix : `${deployment.prefix}-copy`,
      note: deployment.note,
    } as CopyDeployment,
    validationSchema: copyDeploymentSchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const res = await sendForm('POST', routes.deployment.api.copy(deployment.id), values)

      if (res.ok) {
        const copiedDeployment = (await res.json()) as Deployment
        onDeplyomentCopied(copiedDeployment.id)
      } else if (res.status === 409) {
        // There is already a deployment for the selected node with the same prefix
        toast.error(t('alreadyHaveDeployment'))
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  return (
    <DyoCard className={className}>
      <div className="flex flex-row">
        <DyoHeading element="h4" className="text-lg text-bright">
          {t('copyDeployment')}
        </DyoHeading>

        <DyoButton outlined secondary className="ml-auto mr-2 px-10" onClick={onDiscard}>
          {t('common:discard')}
        </DyoButton>

        <DyoButton outlined className="ml-2 px-10" onClick={() => formik.submitForm()}>
          {t('common:copy')}
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

export default CopyDeploymentCard
