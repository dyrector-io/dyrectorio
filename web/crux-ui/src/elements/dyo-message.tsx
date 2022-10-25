import clsx from 'clsx'

interface DyoMessageProps {
  message?: string
  messageType?: 'error' | 'info'
  className?: string
  marginClassName?: string
}

const DyoMessage = (props: DyoMessageProps) => {
  const { message, messageType, className, marginClassName } = props

  return !message ? null : (
    <p
      className={clsx(
        className ?? 'text-xs italic w-80',
        !messageType ? 'text-error-red' : messageType === 'error' ? 'text-error-red' : 'text-warning-orange',
        marginClassName ?? 'mt-1',
      )}
    >
      {message}
    </p>
  )
}

export default DyoMessage
