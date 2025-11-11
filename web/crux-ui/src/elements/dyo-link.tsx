import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { sendQAClickEvent } from 'quality-assurance'
import { useCallback } from 'react'

type DyoLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  LinkProps & {
    qaLabel: string
    reloadDocument?: boolean
    children: React.ReactNode
  } & React.RefAttributes<HTMLAnchorElement>

const DyoLink = (props: DyoLinkProps) => {
  const { qaLabel, href, reloadDocument, onClick: propsOnClick, ...forwardedProps } = props

  const router = useRouter()

  const shouldReload = reloadDocument && router.asPath === href

  const sendQAEvent = useCallback(() => {
    sendQAClickEvent({
      elementType: 'a',
      label: qaLabel,
    })

    if (shouldReload) {
      router.reload()
    }
  }, [qaLabel, shouldReload, router])

  const onClick = propsOnClick
    ? ev => {
        propsOnClick(ev)
        sendQAEvent()
      }
    : sendQAEvent

  return <Link href={href} {...forwardedProps} onClick={onClick} />
}

export default DyoLink
