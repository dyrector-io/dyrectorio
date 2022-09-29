import { DyoCard } from '@app/elements/dyo-card'
import { DyoList } from '@app/elements/dyo-list'
import DyoModal, { DyoConfirmationModal } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import { DeleteImageMessage, VersionImage, WS_TYPE_DELETE_IMAGE } from '@app/models'
import { imageConfigUrl } from '@app/routes'
import { utcDateToLocale } from '@app/utils'
import WebSocketClientEndpoint from '@app/websockets/websocket-client-endpoint'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import EditImageTags from './images/edit-image-tags'
import { getImageTags, ImageTagsMap } from './use-images-websocket'

interface VersionViewListProps {
  productId: string
  versionId: string
  images: VersionImage[]
  imageTags: ImageTagsMap
  versionSock: WebSocketClientEndpoint
  onTagSelected: (image: VersionImage, tag: string) => void
  onFetchTags: (image: VersionImage) => void
}

const VersionViewList = (props: VersionViewListProps) => {
  const { images, imageTags, versionSock, onTagSelected, onFetchTags, productId, versionId } = props

  const { t } = useTranslation('images')
  const router = useRouter()

  const [deleteModalConfig, confirmDelete] = useConfirmation()
  const [selectTagsDialog, setSelectTagsDialog] = useState<VersionImage>()

  const columnWidths = ['w-3/12', 'w-3/12', 'w-2/12', 'w-3/12', 'w-1/12']
  const headers = ['containerName', 'common:registry', 'imageTag', 'common:createdAt', 'common:actions']
  const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased pl-2 py-3 h-11'
  const headerClasses = [
    clsx('rounded-tl-lg pl-6', defaultHeaderClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultHeaderClass),
    clsx('rounded-tr-lg text-right pr-4', defaultHeaderClass),
  ]
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2'
  const itemClasses = [
    clsx('pl-6', defaultItemClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultItemClass),
    clsx('text-right pr-4', defaultItemClass),
  ]

  const onDelete = (item: VersionImage) =>
    confirmDelete(
      () =>
        versionSock.send(WS_TYPE_DELETE_IMAGE, {
          imageId: item.id,
        } as DeleteImageMessage),
      {
        title: t('common:confirmDelete', { name: item.config.name }),
        description: t('common:deleteDescription', { name: item.config.name }),
      },
    )

  const onOpenTagsDialog = (item: VersionImage) => {
    setSelectTagsDialog(item)
    onFetchTags(item)
  }

  const onImageSettings = (item: VersionImage) => router.push(imageConfigUrl(productId, versionId, item.id))

  const itemTemplate = (item: VersionImage) => [
    <a>{item.config.name}</a>,
    <a>{item.registryName}</a>,
    <div className="flex items-center">
      <a>
        {item.name}
        {item.tag ? `:${item.tag}` : null}
      </a>
    </div>,
    <a>{item.createdAt ? utcDateToLocale(item.createdAt) : 'new'}</a>,
    <div>
      <div className="mr-2 inline-block">
        <Image
          className="cursor-pointer"
          src="/archive.svg"
          width={24}
          height={24}
          onClick={() => onOpenTagsDialog(item)}
        />
      </div>
      <div className="mr-2 inline-block">
        <Image className="cursor-pointer" src="/trash-can.svg" width={24} height={24} onClick={() => onDelete(item)} />
      </div>
      <div className="inline-block">
        <Image
          className="cursor-pointer"
          src="/settings.svg"
          width={24}
          height={24}
          onClick={() => onImageSettings(item)}
        />
      </div>
    </div>,
  ]

  return (
    <>
      <DyoCard className="relative mt-4">
        <DyoList
          headers={[...headers.map(h => t(h)), '']}
          headerClassName={headerClasses}
          columnWidths={columnWidths}
          itemClassName={itemClasses}
          data={images}
          noSeparator
          itemBuilder={itemTemplate}
        />
      </DyoCard>
      <DyoConfirmationModal
        config={deleteModalConfig}
        title={t('common:confirmDelete')}
        description={t('common:deleteDescription')}
        confirmText={t('common:delete')}
        className="w-1/4"
        confirmColor="bg-error-red"
      />
      <DyoModal
        className="w-1/3 min-w-[450px]"
        titleClassName="pl-4 font-medium text-xl text-bright mb-3"
        title={t('imageTagsFor', { name: selectTagsDialog?.config.name })}
        open={!!selectTagsDialog}
        onClose={() => setSelectTagsDialog(undefined)}
      >
        <EditImageTags
          selected={selectTagsDialog?.tag ?? ''}
          tags={getImageTags(imageTags, selectTagsDialog)}
          onTagSelected={tag => {
            onTagSelected(selectTagsDialog, tag)
            setSelectTagsDialog({
              ...selectTagsDialog,
              tag,
            })
          }}
        />
      </DyoModal>
    </>
  )
}

export default VersionViewList
