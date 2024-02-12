import DyoButton from '@app/elements/dyo-button'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoMessage from '@app/elements/dyo-message'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { fromApiError } from '@app/error-responses'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PipelineDetails, PipelineRun, TriggerPipeline } from '@app/models'
import { sendForm } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { QA_DIALOG_LABEL_TRIGGER_PIPELINE } from 'quality-assurance'
import { useState } from 'react'
import { OFFLINE_EDITOR_STATE } from '../editor/use-item-editor-state'
import KeyValueInput from '../shared/key-value-input'

type TriggerPipelineCardProps = Omit<DyoCardProps, 'children'> & {
  pipeline: PipelineDetails
  onClose: VoidFunction
  onPipelineTriggered: (run: PipelineRun) => void
}

const TriggerPipelineCard = (props: TriggerPipelineCardProps) => {
  const { className, pipeline, onClose, onPipelineTriggered } = props

  const { t } = useTranslation('pipelines')

  const routes = useTeamRoutes()

  const [confirmConfig, confirm] = useConfirmation()
  const [inputs, setInputs] = useState(pipeline.trigger.inputs)
  const [error, setError] = useState<string>(null)

  const handleApiError = defaultApiErrorHandler(t)

  const onTrigger = async (): Promise<void> => {
    setError(null)

    const confirmed = await confirm({
      title: t('common:areYouSure'),
      description: t('areYouSureTriggerName', pipeline),
      confirmText: t('trigger'),
      qaLabel: QA_DIALOG_LABEL_TRIGGER_PIPELINE,
    })

    if (!confirmed) {
      return
    }

    const body: TriggerPipeline = {
      inputs: inputs && inputs.length > 0 ? inputs : null,
    }

    const res = await sendForm('POST', routes.pipeline.api.runs(pipeline.id), body)

    if (!res.ok) {
      if (res.status === 400) {
        const err = fromApiError(res.status, await res.json())
        setError(err.description)
        return
      }

      await handleApiError(res)
      return
    }

    const run = (await res.json()) as PipelineRun
    onPipelineTriggered(run)
  }

  return (
    <>
      <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')} suppressHydrationWarning>
        <DyoHeading element="h4" className="text-lg text-bright">
          {t('triggerPipeline')}
        </DyoHeading>

        <DyoMessage className="text-xs italic mb-4" message={error} messageType="info" />

        <DyoForm className="flex flex-col gap-4">
          <div className="flex flex-row self-end">
            <DyoButton secondary outlined onClick={onClose}>
              {t('common:discard')}
            </DyoButton>

            <DyoButton onClick={onTrigger}>{t('trigger')}</DyoButton>
          </div>

          <KeyValueInput items={inputs} onChange={setInputs} editorOptions={OFFLINE_EDITOR_STATE} />
        </DyoForm>
      </DyoCard>

      <DyoConfirmationModal config={confirmConfig} />
    </>
  )
}

export default TriggerPipelineCard
