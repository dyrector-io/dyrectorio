import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import DyoLink from '@app/elements/dyo-link'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import DyoTable, { DyoColumn, sortDate, sortString } from '@app/elements/dyo-table'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { DeleteImageMessage, containerNameOfImage, VersionImage, WS_TYPE_DELETE_IMAGE } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { QA_DIALOG_LABEL_DELETE_IMAGE, QA_MODAL_LABEL_IMAGE_TAGS } from 'quality-assurance'
import { useState } from 'react'
import EditImageTags from './images/edit-image-tags'
import { VerionState, VersionActions, selectTagsOfImage } from './use-version-state'

interface VersionViewListProps {
  state: VerionState
  actions: VersionActions
}

const VersionViewList = (props: VersionViewListProps) => {
  const { state, actions } = props

  const { t } = useTranslation('images')
  const routes = useTeamRoutes()

  const [deleteModal, confirmDelete] = useConfirmation()
  const [tagsModalTarget, setTagsModalTarget] = useState<VersionImage>(null)

  const onDelete = async (item: VersionImage) => {
    const confirmed = await confirmDelete({
      qaLabel: QA_DIALOG_LABEL_DELETE_IMAGE,
      title: t('common:areYouSureDeleteName', { name: item.config.name }),
      description: t('common:proceedYouLoseAllDataToName', { name: item.config.name }),
      confirmText: t('common:delete'),
      confirmColor: 'bg-error-red',
    })

    if (!confirmed) {
      return
    }

    state.versionSock.send(WS_TYPE_DELETE_IMAGE, {
      imageId: item.id,
    } as DeleteImageMessage)
  }

  const onOpenTagsDialog = (it: VersionImage) => {
    setTagsModalTarget(it)
    actions.fetchImageTags(it)
  }

  return (
    <>
      <DyoCard className="relative mt-4">
        <DyoTable data={state.version.images} dataKey="id" initialSortColumn={0} initialSortDirection="asc">
          <DyoColumn
            header={t('containerName')}
            sortField={containerNameOfImage}
            body={containerNameOfImage}
            sortable
            sort={sortString}
          />
          <DyoColumn
            header={t('common:registry')}
            field="registry.name"
            className="w-3/12"
            sortable
            sort={sortString}
          />
          <DyoColumn
            header={t('imageTag')}
            className="w-2/12"
            sortable
            sortField={(it: VersionImage) => (it.tag ? `${it.name}:${it.tag}` : it.name)}
            sort={sortString}
            body={(it: VersionImage) => (
              <a>
                {it.name}
                {it.tag ? `:${it.tag}` : null}
              </a>
            )}
          />
          <DyoColumn
            header={t('common:createdAt')}
            className="w-3/12"
            sortable
            sortField="createdAt"
            sort={sortDate}
            suppressHydrationWarning
            body={(it: VersionImage) => (it.createdAt ? utcDateToLocale(it.createdAt) : t('common:new'))}
          />
          <DyoColumn
            header={t('common:actions')}
            className="w-40 text-center"
            body={(it: VersionImage) => (
              <>
                <div className="inline-block">
                  <DyoIcon
                    className="cursor-pointer"
                    src="/archive.svg"
                    alt={t('tag')}
                    size="md"
                    onClick={() => onOpenTagsDialog(it)}
                  />
                </div>
                <div className="inline-block">
                  <DyoIcon
                    className="cursor-pointer"
                    alt={t('common:delete')}
                    src="/trash-can.svg"
                    size="md"
                    onClick={() => onDelete(it)}
                  />
                </div>
                <DyoLink href={routes.containerConfig.details(it.config.id)} qaLabel="version-list-image-config-icon">
                  <DyoIcon src="/container_config.svg" alt={t('common:imageConfig')} size="md" />
                </DyoLink>
              </>
            )}
          />
        </DyoTable>
      </DyoCard>

      <DyoConfirmationModal config={deleteModal} className="w-1/4" />

      {tagsModalTarget && (
        <DyoModal
          className="w-1/3 min-w-[450px]"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={t('imageTagsFor', { name: tagsModalTarget?.config.name })}
          open
          onClose={() => setTagsModalTarget(null)}
          qaLabel={QA_MODAL_LABEL_IMAGE_TAGS}
        >
          <EditImageTags
            selected={tagsModalTarget?.tag ?? ''}
            tags={tagsModalTarget.registry.type === 'unchecked' ? null : selectTagsOfImage(state, tagsModalTarget)}
            onTagSelected={it => actions.selectTagForImage(tagsModalTarget, it)}
          />
        </DyoModal>
      )}
    </>
  )
}

export default VersionViewList
