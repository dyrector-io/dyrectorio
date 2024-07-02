import DyoLink from '@app/elements/dyo-link'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { ROUTE_COMPOSER, ROUTE_INDEX, ROUTE_TEMPLATES, TeamRoutes } from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import NavButton from './nav-button'
import { MenuOption, NavSection } from './nav-section'

export type MenuSection = {
  title: string
  items: MenuOption[]
}

export interface SidebarProps {
  className?: string
}

export const sidebarSectionsOf = (routes: TeamRoutes): MenuSection[] => [
  {
    title: 'components',
    items: [
      {
        icon: '/projects.svg',
        text: 'projects',
        link: routes.project.list(),
      },
      {
        icon: '/deploy.svg',
        text: 'deployments',
        link: routes.deployment.list(),
      },
      {
        icon: '/servers.svg',
        text: 'nodes',
        link: routes.node.list(),
      },
      {
        icon: '/copy.svg',
        text: 'registries',
        link: routes.registry.list(),
      },
      {
        icon: '/config_bundle.svg',
        text: 'configBundles',
        link: routes.configBundle.list(),
      },
      {
        icon: '/package.svg',
        text: 'packages',
        link: routes.package.list(),
      },
    ],
  },
  {
    title: 'integrations',
    items: [
      {
        icon: '/storage.svg',
        text: 'storages',
        link: routes.storage.list(),
      },
      {
        icon: '/robotic-arm.svg',
        text: 'pipelines',
        link: routes.pipeline.list(),
      },
      {
        icon: '/notification.svg',
        text: 'notifications',
        link: routes.notification.list(),
      },
    ],
  },
  {
    title: 'tools',
    items: [
      {
        icon: '/template.svg',
        text: 'templates',
        link: ROUTE_TEMPLATES,
      },
      {
        icon: '/composer.svg',
        text: 'composer',
        link: ROUTE_COMPOSER,
      },
    ],
  },
]

export const Sidebar = (props: SidebarProps) => {
  const { className } = props

  const { t } = useTranslation('common')

  const routes = useTeamRoutes()

  const sidebarSections = routes ? sidebarSectionsOf(routes) : null

  return (
    <div className={className}>
      <div className="mx-12">
        <DyoLink href={ROUTE_INDEX} passHref qaLabel="sidebar-dyo-logo">
          <Image
            className="cursor-pointer mt-4"
            src="/dyrector_io_logo_white.svg"
            alt={t('dyoWhiteLogo')}
            width={160}
            height={27}
          />
        </DyoLink>
      </div>

      {sidebarSections && (
        <div className="flex flex-col grow">
          <div className="flex text-bright my-6">
            <NavButton activeIndicator href={routes.dashboard.index()} icon="/dashboard.svg" text={t('dashboard')} />
          </div>

          {sidebarSections.map((it, index) => (
            <NavSection key={index} className="mb-6" title={t(it.title)} options={it.items} />
          ))}
        </div>
      )}
    </div>
  )
}
