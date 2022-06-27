import { DeploymentEvent, DeploymentRoot } from '@app/models'
import { terminalDateFormat } from '@app/utils'

interface DeploymentEventsTerminalProps {
  deployment: DeploymentRoot
  events: DeploymentEvent[]
}

const DeploymentEventsTerminal = (props: DeploymentEventsTerminalProps) => {
  const events = props.events.sort((one, other) => {
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
    <div className="flex flex-col h-full overflow-y-scroll bg-gray-900 rounded-md ring-2 ring-light-grey border-dark px-2 py-1 mt-4">
      {eventStrings.map((it, index) => (
        <span className="text-bright tracking-widest" key={`event-${index}`}>
          {it}
        </span>
      ))}
    </div>
  )
}

export default DeploymentEventsTerminal
