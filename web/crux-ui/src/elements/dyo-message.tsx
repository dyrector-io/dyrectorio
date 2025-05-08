import clsx from 'clsx'

interface DyoMessageProps {
  message?: string
  messageType?: 'error' | 'info'
  className?: string
  marginClassName?: string
  grow?: boolean
}

const DyoMessage = (props: DyoMessageProps) => {
  const { message, messageType, className, marginClassName, grow } = props

  return !message ? null : (
    <p
      suppressHydrationWarning
      className={clsx(
        className ?? 'text-xs italic',
        grow ? null : 'w-80',
        !messageType ? 'text-error-red' : messageType === 'error' ? 'text-error-red' : 'text-warning-orange',
        marginClassName ?? 'mt-1',
      )}
    >
      {message}
    </p>
  )
}

export default DyoMessage
