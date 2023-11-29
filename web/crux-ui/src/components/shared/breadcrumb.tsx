import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoLink from '@app/elements/dyo-link'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ROUTE_INDEX } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import { sidebarSectionsOf } from '../main/sidebar'

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
  const routes = useTeamRoutes()

  const homeMenu = !routes
    ? null
    : sidebarSectionsOf(routes)
        .flatMap(it => it.items)
        .find(it => it.link === pageUrl)

  return (
    <div key="breadcrumb" className="flex flex-row items-center w-1/2 flex-grow">
      <DyoHeading element="h2" className="text-2xl text-bright">
        {page}
      </DyoHeading>

      <div className="bg-bright w-px h-8 mx-6" />

      <DyoLink href={homeMenu?.link ?? ROUTE_INDEX} qaLabel="breadcrumb-home">
        <DyoIcon
          className="cursor-pointer"
          src={homeMenu?.icon ?? '/breadcrumb_home.svg'}
          alt={t(homeMenu?.text ?? 'home')}
          size="sm"
        />
      </DyoLink>

      {links?.map((it, index) => {
        const last = index >= links.length - 1

        return (
          <div key={`breadcrumb-link-${index}`} className="flex flex-row max-w-lg">
            <div className="mx-4 mt-1">
              <DyoIcon className="aspect-square" src="/breadcrumb_next.svg" alt={t('rightArrowIcon')} size="sm" />
            </div>

            {last ? (
              <DyoLabel className="my-auto truncate">{it.name}</DyoLabel>
            ) : (
              <DyoLink key={`breadcrumb-link-${index}-link`} href={it.url} qaLabel={`breadcrumb-link-${index}`}>
                <DyoLabel className="cursor-pointer my-auto" textColor="text-dyo-turquoise">
                  {it.name}
                </DyoLabel>
              </DyoLink>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Breadcrumb
