import { ContainerLogMessage } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const SCROLL_LOCK_MARGIN = 10

interface InstanceLogTerminalProps {
  events: ContainerLogMessage[]
}

const InstanceLogTerminal = (props: InstanceLogTerminalProps) => {
  const { events: propsEvents } = props

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
  }, [propsEvents, containerRef, autoScroll])

  const eventToString = (event: ContainerLogMessage): string => event.log

  const eventStrings: string[] = propsEvents.map(it => eventToString(it))

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="flex flex-col h-full overflow-y-auto bg-gray-900 rounded-md ring-2 ring-light-grey border-dark px-2 py-1 mt-4 h-128"
      >
        {eventStrings.map((it, index) => (
          <span className="text-bright tracking-widest font-terminal" key={`event-${index}`}>
            {it}
          </span>
        ))}
      </div>
      {!autoScroll && (
        <div
          onClick={scrollToBottom}
          className="absolute right-0 bottom-0 mr-6 mb-3 cursor-pointer animate-bounce flex items-center justify-center"
        >
          <Image src="/arrow_down.svg" alt={t('down')} width="24" height="24" />
        </div>
      )}
    </div>
  )
}

export default InstanceLogTerminal
