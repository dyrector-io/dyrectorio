import DyoIcon from '@app/elements/dyo-icon'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useRef, useState } from 'react'

const SCROLL_LOCK_MARGIN = 10

interface EventsTerminalProps<T> {
  events: T[]
  formatEvent: (event: T) => string[]
}

const EventsTerminal = <T,>(props: EventsTerminalProps<T>) => {
  const { events, formatEvent } = props

  const { t } = useTranslation('common')

  const containerRef = useRef<HTMLDivElement>(undefined)
  const preventScrollEvent = useRef<boolean>(false)
  const [autoScroll, setAutoScroll] = useState<boolean>(true)

  const onScroll = () => {
    if (preventScrollEvent.current) {
      preventScrollEvent.current = false
      return
    }

    const container = containerRef.current
    setAutoScroll(
      container && container.scrollTop >= container.scrollHeight - container.clientHeight - SCROLL_LOCK_MARGIN,
    )
  }

  const scrollToBottom = () => {
    setAutoScroll(true)

    preventScrollEvent.current = true
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }

  useEffect(() => {
    if (!autoScroll || containerRef.current === null) {
      return
    }

    preventScrollEvent.current = true
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [events, containerRef, autoScroll])

  const eventStrings: string[] = events.flatMap(it => formatEvent(it))

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="flex flex-col h-full overflow-y-auto bg-gray-900 rounded-md ring-2 ring-light-grey border-dark px-2 py-1 mt-4 h-128 font-roboto"
      >
        {eventStrings.map((it, index) => (
          <span className="text-bright tracking-widest py-2 text-sm" key={`event-${index}`}>
            {it}
          </span>
        ))}
      </div>
      {!autoScroll && (
        <div
          onClick={scrollToBottom}
          className="absolute right-0 bottom-0 mr-6 mb-3 cursor-pointer animate-bounce flex items-center justify-center"
        >
          <DyoIcon src="/arrow_down.svg" alt={t('down')} size="md" />
        </div>
      )}
    </div>
  )
}

export default EventsTerminal
