import { useEffect, useState } from 'react'

interface DragAndDropList<T> {
  items: T[]
  itemBuilder: (T) => React.ReactNode
  onItemsChange?: (items: T[]) => void
}

const DragAndDropList = <T,>(props: DragAndDropList<T>) => {
  const { itemBuilder, onItemsChange } = props

  const [items, setItems] = useState(props.items)
  const [dragging, setDragging] = useState<T>()

  const onDragEndContainer = () => {
    if (!dragging) {
      return
    }

    setDragging(null)
  }

  const onDragStart = (item: T) => setDragging(item)

  const onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.className = ''
  }

  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.className = 'rounded-md ring-2 ring-bright'
  }

  const onDragExit = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.className = ''
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>, target: T) => {
    event.currentTarget.className = ''

    let newItems = items.filter(it => it !== dragging)
    const dropIndex = newItems.indexOf(target)

    if (dropIndex < 1) {
      newItems = [dragging, ...newItems]
    } else {
      const before = newItems.slice(0, dropIndex)
      const after = newItems.slice(dropIndex)
      newItems = [...before, dragging, ...after]
    }

    setItems(newItems)
    setDragging(null)
  }

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation()
    event.preventDefault()
  }

  useEffect(() => onItemsChange?.call(null, items), [items, onItemsChange])

  return (
    <div className="flex flex-col flex-grow" onDragEnd={onDragEndContainer}>
      {items.map((it, index) => {
        if (it === dragging) {
          return (
            <div key={index} className="opacity-50">
              {props.itemBuilder(it)}
            </div>
          )
        }

        return (
          <div
            key={index}
            draggable
            onDrop={e => onDrop(e, it)}
            onDragOver={onDragOver}
            onDragStart={() => onDragStart(it)}
            onDragEnd={onDragEnd}
            onDragEnter={onDragEnter}
            onDragExit={onDragExit}
          >
            {itemBuilder(it)}
          </div>
        )
      })}
    </div>
  )
}

export default DragAndDropList
