import DragAndDropList from '@app/components/shared/drag-and-drop-list'
import { DyoCard } from '@app/elements/dyo-card'
import { ProductDetails, VersionImage } from '@app/models'
import { useState } from 'react'

interface VersionReorderImagesSectionProps {
  product: ProductDetails
  images: VersionImage[]
  saveRef: React.MutableRefObject<VoidFunction>
  onSave: (images: VersionImage[]) => void
}

const VersionReorderImagesSection = (props: VersionReorderImagesSectionProps) => {
  const { saveRef } = props

  const [items, setItems] = useState(props.images)

  saveRef.current = () => {
    const currentImages = props.images

    const order: Map<string, number> = new Map()
    items.forEach((it, index) => order.set(it.id, index))

    const sorted = currentImages.sort((one, other) => {
      const oneOrder = order.get(one.id)
      const otherOrder = order.get(other.id)

      if (oneOrder !== undefined) {
        return otherOrder !== undefined ? oneOrder - otherOrder : -1
      } else {
        return otherOrder !== undefined ? 1 : 0
      }
    })

    props.onSave(sorted)
  }

  return (
    <DragAndDropList
      items={items}
      onItemsChange={setItems}
      itemBuilder={image => (
        <DyoCard key={image.id} className="flex text-bright m-2 p-4">
          <span className="mr-2">{`#${image.order}`}</span>
          <span className="mx-auto">{image.name}</span>
          {/* <DyoTag>{image.newVersion}</DyoTag> */}
          {/* <span>{image.date}</span> */}
        </DyoCard>
      )}
    />
  )
}

export default VersionReorderImagesSection
