import { UiText } from '@ory/kratos-client'
import { ChangeEventHandler } from 'react'
import { DyoLabel } from '../dyo-label'
import { FormMessage } from './form-message'

interface LabeledInputProps {
  disabled?: boolean
  label: string
  name: string
  type: string
  onChange: ChangeEventHandler<HTMLInputElement>
  value: string
  message?: string | UiText
  messageType?: 'error' | 'info'
}

export const labeledInputClassName =
  'bg-dyo-light-purple w-80 h-11 p-4 ring-2 ring-dyo-light-purple-pale focus:outline-none focus:ring-dyo-eased-purple'

export const LabeledInput = (props: LabeledInputProps) => {
  return (
    <>
      <DyoLabel className="mt-8 mb-2.5" htmlFor={props.name}>
        {props.label}
      </DyoLabel>

      <input
        disabled={props.disabled}
        className={labeledInputClassName}
        id={props.name}
        name={props.name}
        type={props.type}
        onChange={props.onChange}
        value={props.value}
      />

      <FormMessage message={props.message} messageType={props.messageType} />
    </>
  )
}
