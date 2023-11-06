import Link, { LinkProps } from 'next/link'
import { sendQAClickEvent } from 'quality-assurance'
import { useCallback } from 'react'

type DyoLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    qaLabel: string
    children: React.ReactNode
  } & React.RefAttributes<HTMLAnchorElement>

const DyoLink = (props: DyoLinkProps) => {
  const { qaLabel, onClick: propsOnClick, ...forwardedProps } = props

  const sendQAEvent = useCallback(() => {
    sendQAClickEvent({
      elementType: 'a',
      label: qaLabel,
    })
  }, [qaLabel])

  const onClick = propsOnClick
    ? ev => {
        propsOnClick(ev)
        sendQAEvent()
      }
    : sendQAEvent

  return <Link {...forwardedProps} onClick={onClick} />
}

export default DyoLink
