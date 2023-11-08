import DyoIcon from '@app/elements/dyo-icon'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  ROUTE_DOCS,
  ROUTE_INDEX,
  ROUTE_LOGOUT,
  ROUTE_PROFILE,
  ROUTE_TEAMS,
  ROUTE_TEMPLATES,
  TeamRoutes,
} from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'
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
    title: 'project',
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
    ],
  },
  {
    title: 'components',
    items: [
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
        icon: '/notification.svg',
        text: 'notifications',
        link: routes.notification.list(),
      },
      {
        icon: '/template.svg',
        text: 'templates',
        link: ROUTE_TEMPLATES,
      },
      {
        icon: '/storage.svg',
        text: 'storages',
        link: routes.storage.list(),
      },
      {
        icon: '/config_bundle.svg',
        text: 'configBundles',
        link: routes.configBundles.list(),
      },
    ],
  },
  {
    title: 'settings',
    items: [
      {
        icon: '/audit.svg',
        text: 'audit',
        link: routes.audit.list(),
      },
      {
        icon: '/team.svg',
        text: 'teams',
        link: ROUTE_TEAMS,
      },
      {
        icon: '/profile.svg',
        text: 'profile',
        link: ROUTE_PROFILE,
      },
      {
        icon: '/documentation.svg',
        text: 'documentation',
        link: ROUTE_DOCS,
        target: '_blank',
      },
      {
        icon: '/logout.svg',
        text: 'logout',
        link: ROUTE_LOGOUT,
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
        <Link href={ROUTE_INDEX} passHref>
          <Image
            className="cursor-pointer mt-4"
            src="/dyrector_io_logo_white.svg"
            alt={t('dyoWhiteLogo')}
            width={160}
            height={27}
          />
        </Link>
      </div>

      {sidebarSections && (
        <div className="flex flex-col grow">
          <div className="flex text-bright my-6">
            <NavButton href={routes.dashboard.index()} icon={<DyoIcon src="/dashboard.svg" alt={t('dashboard')} />}>
              {t('dashboard')}
            </NavButton>
          </div>

          {sidebarSections.map((it, index) => (
            <NavSection
              key={index}
              className={index < sidebarSections.length - 1 ? 'mb-6' : 'mt-auto mb-3'}
              title={t(it.title)}
              options={it.items}
            />
          ))}
        </div>
      )}
    </div>
  )
}
