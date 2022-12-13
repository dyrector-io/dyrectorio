import { AnchorActions, ANCHOR_ACTION_PREFIX } from '@app/hooks/use-anchor-actions'
import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'

const anchorActionLink = (href: string) => {
  const anchor = href.startsWith('#') ? href.substring(1) : href
  return `${ANCHOR_ACTION_PREFIX}${anchor}`
}

interface AnchorActionProps {
  className?: string
  href: string
  anchors: AnchorActions
  children: React.ReactNode
  disabled?: boolean
}

const AnchorAction = (props: AnchorActionProps) => {
  const { anchors, href: propsHref, children, disabled, className } = props

  // eslint-disable-next-line no-console
  console.assert(Object.keys(anchors).includes(propsHref), 'AnchorAction not found for', propsHref)

  const href = anchorActionLink(propsHref)
  const onClick = anchors[href]

  return (
    <Link className={clsx(disabled ? 'pointer-events-none' : '', className)} href={href} onClick={onClick}>
      {children}
    </Link>
  )
}

export default AnchorAction
