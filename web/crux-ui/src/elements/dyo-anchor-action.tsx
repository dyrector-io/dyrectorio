import { AnchorActions, ANCHOR_ACTION_PREFIX } from '@app/hooks/use-anchor-actions'
import Link from 'next/link'
import React, { HTMLProps } from 'react'

const anchorActionLink = (href: string) => {
  const anchor = href.startsWith('#') ? href.substring(1) : href
  return `${ANCHOR_ACTION_PREFIX}${anchor}`
}

interface AnchorActionProps extends Omit<HTMLProps<HTMLAnchorElement>, 'href' | 'onClick' | 'children'> {
  href: string
  anchors: AnchorActions
  children: React.ReactNode
  disabled?: boolean
}

const AnchorAction = (props: AnchorActionProps) => {
  const { anchors, href: propsHref, children, disabled, ...forwardedProps } = props

  // eslint-disable-next-line no-console
  console.assert(Object.keys(anchors).includes(propsHref), 'AnchorAction not found for', propsHref)

  const href = anchorActionLink(propsHref)
  const onClick = anchors[href]

  return (
    <Link href={href} onClick={onClick}>
      <a className={disabled ? 'pointer-events-none' : ''} {...forwardedProps}>
        {children}
      </a>
    </Link>
  )
}

export default AnchorAction
