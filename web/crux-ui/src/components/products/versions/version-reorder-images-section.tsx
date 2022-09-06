import DragAndDropList from '@app/components/shared/drag-and-drop-list'
import { DyoCard } from '@app/elements/dyo-card'
import { VersionImage } from '@app/models'
import { useState } from 'react'

interface VersionReorderImagesSectionProps {
  images: VersionImage[]
  saveRef: React.MutableRefObject<VoidFunction>
  onSave: (images: VersionImage[]) => void
}

const VersionReorderImagesSection = (props: VersionReorderImagesSectionProps) => {
  const { images, saveRef, onSave } = props

  const [items, setItems] = useState(images)

  saveRef.current = () => {
    const currentImages = images

    const order: Map<string, number> = new Map()
    items.forEach((it, index) => order.set(it.id, index))

    const sorted = currentImages.sort((one, other) => {
      const oneOrder = order.get(one.id)
      const otherOrder = order.get(other.id)

      if (oneOrder !== undefined) {
        return otherOrder !== undefined ? oneOrder - otherOrder : -1
      }

      return otherOrder !== undefined ? 1 : 0
    })

    onSave(sorted)
  }

  const itemTemplate = img => (
    <DyoCard key={img.id} className="flex text-bright m-2 p-4">
      <span className="mr-2">{`#${img.order}`}</span>
      <span className="mx-auto">{img.name}</span>
    </DyoCard>
  )

  return <DragAndDropList items={items} onItemsChange={setItems} itemBuilder={itemTemplate} />
}

export default VersionReorderImagesSection
