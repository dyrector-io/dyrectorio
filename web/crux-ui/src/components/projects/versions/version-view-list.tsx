import { DyoCard } from '@app/elements/dyo-card'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { DeleteImageMessage, VersionImage, WS_TYPE_DELETE_IMAGE } from '@app/models'
import { utcDateToLocale } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useState } from 'react'
import EditImageTags from './images/edit-image-tags'
import { selectTagsOfImage, VerionState, VersionActions } from './use-version-state'

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

  const columnWidths = ['', 'w-3/12', 'w-2/12', 'w-3/12', 'w-28']
  const headers = ['containerName', 'common:registry', 'imageTag', 'common:createdAt', 'common:actions']
  const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased px-2 py-3 h-11'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultHeaderClass),
    clsx('rounded-tr-lg pr-6 text-center', defaultHeaderClass),
  ]
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultItemClass),
    clsx('pr-6 text-center', defaultItemClass),
  ]

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

  const itemTemplate = (item: VersionImage) => [
    item.config.name,
    item.registry.name,
    <div className="flex items-center">
      <a>
        {item.name}
        {item.tag ? `:${item.tag}` : null}
      </a>
    </div>,
    <span suppressHydrationWarning>{item.createdAt ? utcDateToLocale(item.createdAt) : t('common:new')}</span>,
    <div className="flex flex-wrap justify-center">
      <div className="inline-block">
        <DyoIcon
          className="cursor-pointer"
          src="/archive.svg"
          alt={t('tag')}
          size="md"
          onClick={() => onOpenTagsDialog(item)}
        />
      </div>
      <div className="inline-block">
        <DyoIcon
          className="cursor-pointer"
          alt={t('common:delete')}
          src="/trash-can.svg"
          size="md"
          onClick={() => onDelete(item)}
        />
      </div>
      <Link href={routes.project.versions(state.projectId).imageDetails(state.version.id, item.id)} passHref>
        <DyoIcon src="/image_config_icon.svg" alt={t('common:settings')} size="md" />
      </Link>
    </div>,
  ]

  return (
    <>
      <DyoCard className="relative mt-4">
        <DyoList
          headers={[...headers.map(h => t(h))]}
          headerClassName={headerClasses}
          columnWidths={columnWidths}
          itemClassName={itemClasses}
          data={state.version.images}
          noSeparator
          itemBuilder={itemTemplate}
        />
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
