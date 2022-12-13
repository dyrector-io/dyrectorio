import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'

export type BreadcrumbLink = {
  name: string
  url: string
}

export interface BreadcrumbProps {
  page: string
  pageUrl: string
  links?: BreadcrumbLink[]
}

const Breadcrumb = (props: BreadcrumbProps) => {
  const { page, pageUrl, links } = props

  const { t } = useTranslation('common')

  return (
    <div key="breadcrumb" className="flex flex-row items-center w-1/2 flex-grow">
      <DyoHeading element="h2" className="text-2xl text-bright">
        {page}
      </DyoHeading>

      <div className="bg-bright w-px h-8 mx-6" />

      <Link href={pageUrl} passHref>
        <Image className="cursor-pointer" src="/breadcrumb_home.svg" alt={t('home')} width={16} height={16} />
      </Link>

      {links?.map((it, index) => {
        const last = index >= links.length - 1

        return (
          <div key={`breadcrumb-link-${index}`} className="flex flex-row max-w-lg">
            <div className="mx-4 mt-1">
              <Image
                className="aspect-square"
                src="/breadcrumb_next.svg"
                alt={t('rightArrowIcon')}
                width={16}
                height={16}
              />
            </div>

            {last ? (
              <DyoLabel className="my-auto truncate">{it.name}</DyoLabel>
            ) : (
              <Link key={`breadcrumb-link-${index}-link`} href={it.url} passHref>
                <DyoLabel className="cursor-pointer my-auto" textColor="text-dyo-turquoise">
                  {it.name}
                </DyoLabel>
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Breadcrumb
