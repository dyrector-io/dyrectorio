import DragAndDropList from '@app/components/shared/drag-and-drop-list'
import { DyoCard } from '@app/elements/dyo-card'
import { VersionImage } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

const sortImages = (images: VersionImage[], order: Map<string, number>): VersionImage[] => {
  const sorted = images.sort((one, other) => {
    const oneOrder = order.get(one.id)
    const otherOrder = order.get(other.id)

    if (oneOrder !== undefined) {
      return otherOrder !== undefined ? oneOrder - otherOrder : -1
    }

    return otherOrder !== undefined ? 1 : 0
  })

  return sorted
}

const orderImagesByIndex = (images: VersionImage[], newOrder: VersionImage[]): VersionImage[] => {
  const order: Map<string, number> = new Map()
  newOrder.forEach((it, index) => order.set(it.id, index))

  return sortImages(images, order)
}

const orderImages = (images: VersionImage[]): VersionImage[] => {
  const order: Map<string, number> = new Map()
  images.forEach(it => order.set(it.id, it.order))

  return sortImages(images, order)
}

type VersionReorderImagesSectionProps = {
  images: VersionImage[]
  saveRef: React.MutableRefObject<VoidFunction>
  onSave: (images: VersionImage[]) => void
}

const VersionReorderImagesSection = (props: VersionReorderImagesSectionProps) => {
  const { images, saveRef, onSave } = props

  const { t } = useTranslation('images')

  const [items, setItems] = useState(orderImages(images))

  saveRef.current = () => {
    const sorted = orderImagesByIndex(images, items)

    onSave(sorted)
  }

  const itemTemplate = (img: VersionImage, index: number) => (
    <DyoCard key={img.id} className="grid grid-cols-4 items-center text-bright m-2 p-4">
      <span className="mx-4 text-dyo-turquoise">{`#${++index}`}</span>

      <span className="text-bright">{img.config?.name ?? img.name}</span>

      <span className="text-sm text-bright-muted">{img.registry.name}</span>

      <div className="flex items-center">
        <span className="text-md text-light-eased">{`${img.name}:`}</span>

        <span className={clsx('text-md', img.tag ? 'text-light-eased' : 'text-warning-orange/75')}>
          {`${img.tag ? img.tag : t('unknownTag')}`}
        </span>
      </div>
    </DyoCard>
  )

  return <DragAndDropList items={items} onItemsChange={setItems} itemBuilder={itemTemplate} />
}

export default VersionReorderImagesSection
