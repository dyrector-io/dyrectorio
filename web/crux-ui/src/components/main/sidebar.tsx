import {
  ROUTE_AUDIT,
  ROUTE_DEPLOYMENTS,
  ROUTE_INDEX,
  ROUTE_LOGOUT,
  ROUTE_NODES,
  ROUTE_NOTIFICATIONS,
  ROUTE_PRODUCTS,
  ROUTE_PROFILE,
  ROUTE_REGISTRIES,
  ROUTE_TEAMS,
  ROUTE_TEMPLATES,
} from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'
import { NavSection } from './nav-section'

export interface SidebarProps {
  className?: string
}

export const Sidebar = (props: SidebarProps) => {
  const { className } = props

  const { t } = useTranslation('common')

  const productOptions = [
    {
      icon: <Image src="/products.svg" alt={t('products')} width={18} height={18} />,
      text: 'products',
      link: ROUTE_PRODUCTS,
    },
    {
      icon: <Image src="/deploy.svg" alt={t('deployments')} width={18} height={18} />,
      text: 'deployments',
      link: ROUTE_DEPLOYMENTS,
    },
  ]

  const componentOptions = [
    {
      icon: <Image src="/servers.svg" alt={t('nodes')} width={18} height={18} />,
      text: 'nodes',
      link: ROUTE_NODES,
    },
    {
      icon: <Image src="/copy.svg" alt={t('registries')} width={18} height={18} />,
      text: 'registries',
      link: ROUTE_REGISTRIES,
    },
    {
      icon: <Image src="/notification.svg" alt={t('notifications')} width={18} height={18} />,
      text: 'notifications',
      link: ROUTE_NOTIFICATIONS,
    },
    {
      icon: <Image src="/template.svg" alt={t('templates')} width={18} height={18} />,
      text: 'templates',
      link: ROUTE_TEMPLATES,
    },
  ]

  const settingsOptions = [
    {
      icon: <Image src="/audit.svg" alt={t('audit')} width={18} height={18} />,
      text: 'audit',
      link: ROUTE_AUDIT,
    },
    {
      icon: <Image src="/team.svg" alt={t('teams')} width={18} height={18} />,
      text: 'teams',
      link: ROUTE_TEAMS,
    },
    {
      icon: <Image src="/profile.svg" alt={t('profile')} width={18} height={18} />,
      text: 'profile',
      link: ROUTE_PROFILE,
    },
    {
      icon: <Image src="/logout.svg" alt={t('logout')} width={18} height={18} />,
      text: 'logout',
      link: ROUTE_LOGOUT,
    },
  ]

  return (
    <div className={className}>
      <div className="mx-12">
        <Link href={ROUTE_INDEX}>
          <a>
            <Image
              className="cursor-pointer"
              src="/dyrector_io_logo_white.svg"
              alt={t('dyoWhiteLogo')}
              width={160}
              height={64}
            />
          </a>
        </Link>
      </div>

      <div className="flex flex-col flex-grow pb-4">
        <NavSection className="mt-12" title={t('product')} options={productOptions} />

        <NavSection className="mt-12" title={t('components')} options={componentOptions} />

        <NavSection className="mt-auto mb-4" title={t('settings')} options={settingsOptions} />
      </div>
    </div>
  )
}
