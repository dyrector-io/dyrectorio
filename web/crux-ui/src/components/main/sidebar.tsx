import DyoIcon from '@app/elements/dyo-icon'
import {
  ROUTE_AUDIT,
  ROUTE_DASHBOARD,
  ROUTE_DEPLOYMENTS,
  ROUTE_DOCS,
  ROUTE_INDEX,
  ROUTE_LOGOUT,
  ROUTE_NODES,
  ROUTE_NOTIFICATIONS,
  ROUTE_PROFILE,
  ROUTE_PROJECTS,
  ROUTE_REGISTRIES,
  ROUTE_STORAGES,
  ROUTE_TEAMS,
  ROUTE_TEMPLATES,
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

export const SIDEBAR_SECTIONS: MenuSection[] = [
  {
    title: 'project',
    items: [
      {
        icon: '/projects.svg',
        text: 'projects',
        link: ROUTE_PROJECTS,
      },
      {
        icon: '/deploy.svg',
        text: 'deployments',
        link: ROUTE_DEPLOYMENTS,
      },
    ],
  },
  {
    title: 'components',
    items: [
      {
        icon: '/servers.svg',
        text: 'nodes',
        link: ROUTE_NODES,
      },
      {
        icon: '/copy.svg',
        text: 'registries',
        link: ROUTE_REGISTRIES,
      },
      {
        icon: '/notification.svg',
        text: 'notifications',
        link: ROUTE_NOTIFICATIONS,
      },
      {
        icon: '/template.svg',
        text: 'templates',
        link: ROUTE_TEMPLATES,
      },
      {
        icon: '/storage.svg',
        text: 'storages',
        link: ROUTE_STORAGES,
      },
    ],
  },
  {
    title: 'settings',
    items: [
      {
        icon: '/audit.svg',
        text: 'audit',
        link: ROUTE_AUDIT,
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

      <div className="flex flex-col flex-grow pb-4">
        <div className="mt-6 flex text-bright">
          <NavButton href={ROUTE_DASHBOARD} icon={<DyoIcon src="/dashboard.svg" alt={t('dashboard')} />}>
            {t('dashboard')}
          </NavButton>
        </div>

        {SIDEBAR_SECTIONS.map((it, index) => (
          <NavSection
            className={index < SIDEBAR_SECTIONS.length - 1 ? 'mt-6' : 'mt-auto mt-6'}
            title={t(it.title)}
            options={it.items}
          />
        ))}
      </div>
    </div>
  )
}
