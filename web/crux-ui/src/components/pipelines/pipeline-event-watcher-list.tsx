import { DyoCard } from '@app/elements/dyo-card'
import DyoImgButton from '@app/elements/dyo-img-button'
import DyoTable, { DyoColumn } from '@app/elements/dyo-table'
import { PipelineEventWatcher } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'

type PipelineEventWatcherListProps = {
  eventWatchers: PipelineEventWatcher[]
  onEditEventWatcher: (eventWatcher: PipelineEventWatcher) => void
  onDeleteEventWatcher: (eventWatcher: PipelineEventWatcher) => Promise<void>
}

const PipelineEventWatcherList = (props: PipelineEventWatcherListProps) => {
  const { eventWatchers, onEditEventWatcher, onDeleteEventWatcher } = props

  const { t } = useTranslation('pipelines')

  return eventWatchers.length < 1 ? (
    <span className="text-bright m-auto">{t('noEventWatchers')}</span>
  ) : (
    <DyoCard className="mt-4">
      <DyoTable data={eventWatchers} dataKey="id">
        <DyoColumn header={t('common:name')} className="text-center" body={(it: PipelineEventWatcher) => it.name} />

        <DyoColumn
          header={t('common:event')}
          className="w-2/12"
          suppressHydrationWarning
          body={(it: PipelineEventWatcher) => t(`triggerEvents.${it.event}`)}
        />

        <DyoColumn
          header={t('common:registry')}
          className="w-2/12"
          suppressHydrationWarning
          body={(it: PipelineEventWatcher) => it.registry?.name}
        />

        <DyoColumn
          header={t('common:createdAt')}
          className="w-2/12"
          suppressHydrationWarning
          body={(it: PipelineEventWatcher) => utcDateToLocale(it.createdAt)}
        />

        <DyoColumn
          header={t('common:actions')}
          className="w-40 text-center"
          bodyClassName="flex flex-row justify-center"
          preventClickThrough
          body={(it: PipelineEventWatcher) => (
            <>
              <DyoImgButton src="/edit.svg" alt={t('common:edit')} height={24} onClick={() => onEditEventWatcher(it)} />

              <DyoImgButton
                src="/trash-can.svg"
                alt={t('common:delete')}
                height={24}
                onClick={async () => await onDeleteEventWatcher(it)}
              />
            </>
          )}
        />
      </DyoTable>
    </DyoCard>
  )
}

export default PipelineEventWatcherList
