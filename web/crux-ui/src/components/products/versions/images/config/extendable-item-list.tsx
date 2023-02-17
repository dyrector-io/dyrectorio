import DyoImgButton from '@app/elements/dyo-img-button'
import DyoMessage from '@app/elements/dyo-message'
import useRepatch, { RepatchAction } from '@app/hooks/use-repatch'
import clsx from 'clsx'
import { useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import ConfigSectionLabel from './config-section-label'

const addItem =
  <T extends Item>(item: Omit<T, 'id'>): RepatchAction<InternalState<T>> =>
  state => {
    const itemId = uuid()
    return {
      ...state,
      items: [...state.items, { ...item, id: itemId } as T],
    }
  }

const removeItem =
  <T extends Item>(item: T): RepatchAction<InternalState<T>> =>
  state => ({
    ...state,
    items: state.items.filter(it => it.id !== item.id),
    editedItemId: state.editedItemId !== item.id ? state.editedItemId : null,
  })

const changeItem =
  <T extends Item>(item: T): RepatchAction<InternalState<T>> =>
  state => {
    const { items } = state
    const index = items.findIndex(it => it.id === item.id)
    if (index < 0) {
      return state
    }

    const newItems = [...items]
    newItems[index] = item

    return {
      ...state,
      items: newItems,
    }
  }

const mergeItems =
  <T extends Item>(items: T[]): RepatchAction<InternalState<T>> =>
  state => {
    if (JSON.stringify(state.items) === JSON.stringify(items)) {
      return state
    }

    if (!state.editedItemId) {
      return {
        ...state,
        items: items ?? [],
      }
    }

    const editedItem = state.items.find(it => it.id === state.editedItemId)

    const newItems = [...items]

    if (editedItem) {
      const index = newItems.findIndex(it => it.id === state.editedItemId)
      if (index < 0) {
        newItems.push(editedItem)
      } else {
        newItems[index] = editedItem
      }
    }

    return {
      ...state,
      items: newItems,
    }
  }

const focusItem =
  <T extends Item>(id: string): RepatchAction<InternalState<T>> =>
  state => ({
    ...state,
    editedItemId: id,
  })

type Item = {
  id: string
}

type InternalState<T> = {
  items: T[]
  editedItemId?: string
}

interface ExtendableItemListProps<T extends Item> {
  itemClassName?: string
  disabled?: boolean
  label: string
  items: T[]
  renderItem: (
    item: T,
    removeButton: (className?: string) => React.ReactNode,
    onPatch: (item: Partial<Omit<T, 'id'>>) => void,
  ) => React.ReactNode
  findErrorMessage: (index: number) => string
  onPatch: (items: T[]) => void
  onResetSection: VoidFunction
  emptyItemFactory: () => Omit<T, 'id'>
}

const ExtendableItemList = <T extends Item>(props: ExtendableItemListProps<T>) => {
  const {
    items: propsItems,
    disabled,
    label,
    renderItem,
    findErrorMessage,
    onPatch: propsOnPatch,
    onResetSection,
    emptyItemFactory,
    itemClassName,
  } = props

  const [state, dispatch] = useRepatch<InternalState<T>>({
    items: propsItems ?? [],
    editedItemId: null,
  })

  useEffect(() => dispatch(mergeItems(propsItems)), [propsItems, dispatch])

  const reduceAndSendPatch = (reducer: RepatchAction<InternalState<T>>) => {
    const newState = reducer(state)
    dispatch(reducer)

    if (JSON.stringify(newState.items) !== JSON.stringify(propsItems)) {
      propsOnPatch(newState.items)
    }
  }

  const { items } = state

  const hasValue = !!propsItems

  return (
    <div className="flex flex-col mb-2">
      <div className="flex flex-row mb-2">
        <ConfigSectionLabel
          className="mr-2"
          labelClassName="text-bright font-semibold tracking-wide"
          disabled={!hasValue || disabled || !onResetSection}
          onResetSection={onResetSection}
        >
          {label.toUpperCase()}
        </ConfigSectionLabel>

        {!disabled && (
          <DyoImgButton onClick={() => reduceAndSendPatch(addItem(emptyItemFactory()))} src="/plus.svg" alt="add" />
        )}
      </div>

      {items.length < 1 ? null : (
        <div
          className={
            itemClassName ?? 'grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 grid-flow-column gap-x-10 gap-y-8 mb-8'
          }
        >
          {items.map((item, index) => {
            const message = findErrorMessage(index)
            const removeButton = (removeButtonClassName: string) =>
              !disabled && (
                <DyoImgButton
                  onClick={() => reduceAndSendPatch(removeItem(item))}
                  src="/minus.svg"
                  alt="remove"
                  className={clsx('w-6 h-6', removeButtonClassName ?? 'self-center')}
                  imageClassName="absolute"
                  disabled={disabled}
                />
              )

            return (
              <div
                key={`item-${index}`}
                className="flex flex-col p-1"
                onFocus={() => dispatch(focusItem(item.id))}
                onBlur={() => dispatch(focusItem(null))}
              >
                {renderItem(item, removeButton, it =>
                  reduceAndSendPatch(
                    changeItem({
                      ...item,
                      ...it,
                    }),
                  ),
                )}

                {message ? <DyoMessage message={message} messageType="error" marginClassName="m-2" /> : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ExtendableItemList
