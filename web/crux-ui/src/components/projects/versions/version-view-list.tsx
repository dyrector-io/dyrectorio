import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { DeleteImageMessage, VersionImage, WS_TYPE_DELETE_IMAGE } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useState } from 'react'
import EditImageTags from './images/edit-image-tags'
import { selectTagsOfImage, VerionState, VersionActions } from './use-version-state'
import DyoTable, { DyoColumn, sortDate, sortString } from '@app/elements/dyo-table'

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
        <DyoTable data={state.version.images}>
          <DyoColumn header={t('containerName')} field="config.name" sortable sort={sortString} />
          <DyoColumn header={t('common:registry')} field="registry.name" sortable sort={sortString} />
          <DyoColumn
            header={t('imageTag')}
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
            sortable
            sortField="createdAt"
            sort={sortDate}
            suppressHydrationWarning
            body={(it: VersionImage) => (it.createdAt ? utcDateToLocale(it.createdAt) : t('common:new'))}
          />
          <DyoColumn
            header={t('common:actions')}
            width="10%"
            align="center"
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
                <Link href={routes.project.versions(state.projectId).imageDetails(state.version.id, it.id)} passHref>
                  <DyoIcon src="/image_config_icon.svg" alt={t('common:imageConfig')} size="md" />
                </Link>
              </>
            )}
          />
        </DyoTable>
      </DyoCard>

      <DyoConfirmationModal config={deleteModal} className="w-1/4" />

      {!tagsModalTarget ? null : (
        <DyoModal
          className="w-1/3 min-w-[450px]"
          titleClassName="pl-4 font-medium text-xl text-bright mb-3"
          title={t('imageTagsFor', { name: tagsModalTarget?.config.name })}
          open
          onClose={() => setTagsModalTarget(null)}
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
