import DyoButton from '@app/elements/dyo-button'
import { DyoCard, DyoCardProps } from '@app/elements/dyo-card'
import DyoForm from '@app/elements/dyo-form'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import { defaultApiErrorHandler } from '@app/errors'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { PipelineDetails, repositoryNameOf } from '@app/models'
import { sendForm } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import { OFFLINE_EDITOR_STATE } from '../editor/use-item-editor-state'
import KeyValueInput from '../shared/key-value-input'
import PipelineHeading from './pipeline-heading'
import PipelineTypeTag from './pipeline-type-tag'

type TriggerPipelineCardProps = Omit<DyoCardProps, 'children'> & {
  pipeline: PipelineDetails
}

const TriggerPipelineCard = (props: TriggerPipelineCardProps) => {
  const { className, pipeline } = props

  const { t } = useTranslation('pipelines')

  const routes = useTeamRoutes()

  const [confirmConfig, confirm] = useConfirmation()
  const [inputs, setInputs] = useState(pipeline.inputs)

  const handleApiError = defaultApiErrorHandler(t)

  const onTrigger = async (): Promise<void> => {
    const confirmed = await confirm({
      title: t('common:areYouSure'),
      description: t('areYouSureTriggerName', pipeline),
      confirmText: t('trigger'),
    })

    if (!confirmed) {
      return
    }

    const body: Record<string, string> =
      inputs.length < 1
        ? null
        : inputs.reduce((result, it) => {
            const { key, value } = it

            result[key] = value
            return result
          }, {})

    const res = await sendForm('POST', routes.pipeline.api.trigger(pipeline.id), body)

    if (!res.ok) {
      await handleApiError(res)
    }
  }

  return (
    <>
      <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')} suppressHydrationWarning>
        <PipelineHeading pipeline={pipeline} />

        <div className="flex flex-row my-4">
          <span className="text-ellipsis overflow-hidden whitespace-nowrap text-light-eased">
            {repositoryNameOf(pipeline)}
          </span>

          <PipelineTypeTag className="ml-auto" type={pipeline.type} />
        </div>

        <DyoForm className="flex flex-col gap-4">
          <KeyValueInput items={inputs} onChange={setInputs} editorOptions={OFFLINE_EDITOR_STATE} />

          <DyoButton className="px-6 ml-auto" onClick={onTrigger}>
            {t('trigger')}
          </DyoButton>
        </DyoForm>
      </DyoCard>

      <DyoConfirmationModal config={confirmConfig} />
    </>
  )
}

export default TriggerPipelineCard
