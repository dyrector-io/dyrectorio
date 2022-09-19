import clsx from 'clsx'

interface DyoMessageProps {
  message?: string
  messageType?: 'error' | 'info'
  className?: string
}

const DyoMessage = (props: DyoMessageProps) => {
  const { message, messageType, className } = props

  return !message ? null : (
    <p
      className={clsx(
        className ?? 'mt-1 text-xs italic w-80',
        !messageType ? 'text-error-red' : messageType === 'error' ? 'text-error-red' : 'text-warning-orange',
      )}
    >
      {message}
    </p>
  )
}

export default DyoMessage
