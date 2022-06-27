import clsx from 'clsx'
import { DyoButton } from '../dyo-button'
import { DyoCard } from '../dyo-card'

interface FormCardProps {
  className?: string
  submitLabel: string
  submitDisabled?: boolean
  submitWidth?: string
  onSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void
  afterForm?: React.ReactNode
  children: React.ReactNode
}

export const FormCard = (props: FormCardProps) => {
  return (
    <>
      <div className={clsx('flex max-w-7xl justify-center', props.className)}>
        <div className="flex-col">
          <DyoCard>
            <form className="flex flex-col" onSubmit={props.onSubmit}>
              {props.children}

              <div className="flex justify-center mt-8">
                <DyoButton
                  className={props.submitWidth ?? 'w-60'}
                  disabled={props.submitDisabled}
                  type="submit"
                >
                  {props.submitLabel}
                </DyoButton>
              </div>
            </form>

            {props.afterForm}
          </DyoCard>
        </div>
      </div>
    </>
  )
}
