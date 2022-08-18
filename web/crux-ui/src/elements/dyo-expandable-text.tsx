import { useOverflowDetection } from '@app/hooks/use-overflow-detection'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import { DyoButton } from './dyo-button'
import DyoModal from './dyo-modal'

interface DyoExpandableTextProps {
  text: string
  className?: string
  buttonClassName?: string
  modalClassName?: string
  lineClamp: 1 | 2 | 3 | 4 | 5 | 6
  modalTitle: string
}

const lineClamp = ['line-clamp-1', 'line-clamp-2', 'line-clamp-3', 'line-clamp-4', 'line-clamp-5', 'line-clamp-6'] // We need to have these for the treeshaking

export const DyoExpandableText = (props: DyoExpandableTextProps) => {
  const { t } = useTranslation('common')

  const [overflow, overflowRef] = useOverflowDetection<HTMLParagraphElement>()
  const [show, setShow] = useState(false)

  return (
    <>
      <p ref={overflowRef} className={clsx(props.className, lineClamp[props.lineClamp - 1], 'break-words')}>
        {props.text}
      </p>
      {!overflow ? null : (
        <DyoButton className={props.buttonClassName ?? ''} text onClick={() => setShow(true)}>
          {t('showAll')}
        </DyoButton>
      )}
      {!show ? null : (
        <DyoModal
          className={props.modalClassName ?? 'w-1/2 h-1/2'}
          title={props.modalTitle}
          open={show}
          onClose={() => setShow(false)}
        >
          <p className="text-bright mt-8 overflow-y-auto">{props.text}</p>
        </DyoModal>
      )}
    </>
  )
}
