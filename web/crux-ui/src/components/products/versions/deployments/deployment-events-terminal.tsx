import { DeploymentEvent } from '@app/models'
import { terminalDateFormat } from '@app/utils'
import { createRef, useEffect } from 'react'

interface DeploymentEventsTerminalProps {
  events: DeploymentEvent[]
}

const DeploymentEventsTerminal = (props: DeploymentEventsTerminalProps) => {
  const { events: propsEvents } = props

  const containerRef = createRef<HTMLDivElement>()

  useEffect(() => {
    if (containerRef.current == null) {
      return
    }

    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [propsEvents, containerRef])

  const events = propsEvents.sort((one, other) => {
    const oneDate = new Date(one.createdAt)
    const otherDate = new Date(other.createdAt)
    return oneDate.getTime() - otherDate.getTime()
  })

  const eventToString = (event: DeploymentEvent): string[] => {
    if (event.type !== 'log') {
      return []
    }

    const date = new Date(event.createdAt)
    const value = event.value as string[]
    return value.map(it => `${terminalDateFormat(date)}\xa0\xa0\xa0\xa0${it}`)
  }

  const eventStrings: string[] = events.flatMap(it => eventToString(it))

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full overflow-y-auto bg-gray-900 rounded-md ring-2 ring-light-grey border-dark px-2 py-1 mt-4 h-96"
    >
      {eventStrings.map((it, index) => (
        <span className="text-bright tracking-widest" key={`event-${index}`}>
          {it}
        </span>
      ))}
    </div>
  )
}

export default DeploymentEventsTerminal
