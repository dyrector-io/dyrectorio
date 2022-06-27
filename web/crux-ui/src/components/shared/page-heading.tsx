import React from 'react'
import Breadcrumb, { BreadcrumbLink } from './breadcrumb'

export interface EditButtonsProps {
  pageLink: BreadcrumbLink
  subLinks?: BreadcrumbLink[]
  children?: React.ReactNode
}

const PageHeading = (props: EditButtonsProps) => {
  const { pageLink: selfLink, subLinks, children } = props

  return (
    <div className="flex flex-row items-center mb-4">
      <Breadcrumb page={selfLink.name} pageUrl={selfLink.url} links={subLinks ?? (selfLink ? [selfLink] : [])} />

      {children}
    </div>
  )
}

export default PageHeading
