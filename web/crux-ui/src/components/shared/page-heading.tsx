import React from 'react'
import Breadcrumb, { BreadcrumbLink } from './breadcrumb'

export interface EditButtonsProps {
  pageLink: BreadcrumbLink
  sublinks?: BreadcrumbLink[]
  children?: React.ReactNode
}

const PageHeading = (props: EditButtonsProps) => {
  const { pageLink: selfLink, sublinks, children } = props

  return (
    <div className="flex flex-row items-center mb-4 h-10">
      <Breadcrumb page={selfLink.name} pageUrl={selfLink.url} links={sublinks ?? (selfLink ? [selfLink] : [])} />

      {children}
    </div>
  )
}

export default PageHeading
