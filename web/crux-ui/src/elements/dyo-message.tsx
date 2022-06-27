import clsx from 'clsx'

interface DyoMessageProps {
  message?: string
  messageType?: 'error' | 'info'
}

export const DyoMessage = (props: DyoMessageProps) => {
  const message = props.message
  const messageType = props.messageType ?? 'error'

  return (
    <>
      {!message ? null : (
        <p
          className={clsx('mt-1 text-xs italic', messageType === 'error' ? 'text-error-red ' : 'text-warning-orange ')}
        >
          {message}
        </p>
      )}
    </>
  )
}
