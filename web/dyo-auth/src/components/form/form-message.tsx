import { UiText } from '@ory/kratos-client'
import clsx from 'clsx'

interface FormMessageProps {
  message?: string | UiText
  messageType?: 'error' | 'info'
}

export const FormMessage = (props: FormMessageProps) => {
  let message = null
  let messageType = null

  if (typeof props.message === 'string') {
    message = props.message
    messageType = props.messageType ?? 'info'
  } else {
    message = props.message?.text
    messageType = props.message?.type
  }

  return (
    <>
      {!message ? null : (
        <p
          className={clsx(
            'mt-1 text-xs italic',
            messageType === 'error' ? 'text-red-600 ' : 'text-yellow-600 ',
          )}
        >
          {message}
        </p>
      )}
    </>
  )
}
