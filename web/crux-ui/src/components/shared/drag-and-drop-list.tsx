import { useEffect, useRef, useState } from 'react'

interface DragAndDropListProps<T> {
  items: T[]
  itemBuilder: (T, index) => React.ReactNode
  onItemsChange?: (items: T[]) => void
}

type DragState = { counter: number; current: HTMLDivElement }

const DragAndDropList = <T,>(props: DragAndDropListProps<T>) => {
  const { itemBuilder, onItemsChange, items: propsItems } = props

  const [items, setItems] = useState(propsItems)
  const [dragging, setDragging] = useState<T>()

  const dragState = useRef<DragState>({ counter: 0, current: null })

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
    const { counter, current } = dragState.current

    if (current === event.currentTarget) {
      dragState.current.counter = counter + 1
    } else {
      dragState.current = {
        counter: 1,
        current: event.currentTarget,
      }

      event.currentTarget.className = 'rounded-md ring-2 ring-bright'
    }
  }

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    const { counter, current } = dragState.current

    if (current === event.currentTarget) {
      dragState.current.counter -= 1
    } else {
      event.currentTarget.className = ''
    }

    if (counter === 0 && current != null) {
      event.currentTarget.className = ''
      dragState.current.current = null
    }
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>, target: T) => {
    event.currentTarget.className = ''

    const dropIndex = items.indexOf(target)
    let newItems = items.filter(it => it !== dragging)

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
              {itemBuilder(it, index)}
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
            onDragLeave={onDragLeave}
          >
            {itemBuilder(it, index)}
          </div>
        )
      })}
    </div>
  )
}

export default DragAndDropList
