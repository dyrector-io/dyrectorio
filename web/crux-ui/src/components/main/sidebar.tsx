import DyoIcon from '@app/elements/dyo-icon'
import {
  ROUTE_AUDIT,
  ROUTE_DASHBOARD,
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
import NavButton from './nav-button'
import { NavSection } from './nav-section'

export interface SidebarProps {
  className?: string
}

export const Sidebar = (props: SidebarProps) => {
  const { className } = props

  const { t } = useTranslation('common')

  const productOptions = [
    {
      icon: <DyoIcon src="/products.svg" alt={t('products')} />,
      text: 'products',
      link: ROUTE_PRODUCTS,
    },
    {
      icon: <DyoIcon src="/deploy.svg" alt={t('deployments')} />,
      text: 'deployments',
      link: ROUTE_DEPLOYMENTS,
    },
  ]

  const componentOptions = [
    {
      icon: <DyoIcon src="/servers.svg" alt={t('nodes')} />,
      text: 'nodes',
      link: ROUTE_NODES,
    },
    {
      icon: <DyoIcon src="/copy.svg" alt={t('registries')} />,
      text: 'registries',
      link: ROUTE_REGISTRIES,
    },
    {
      icon: <DyoIcon src="/notification.svg" alt={t('notifications')} />,
      text: 'notifications',
      link: ROUTE_NOTIFICATIONS,
    },
    {
      icon: <DyoIcon src="/template.svg" alt={t('templates')} />,
      text: 'templates',
      link: ROUTE_TEMPLATES,
    },
  ]

  const settingsOptions = [
    {
      icon: <DyoIcon src="/audit.svg" alt={t('audit')} />,
      text: 'audit',
      link: ROUTE_AUDIT,
    },
    {
      icon: <DyoIcon src="/team.svg" alt={t('teams')} />,
      text: 'teams',
      link: ROUTE_TEAMS,
    },
    {
      icon: <DyoIcon src="/profile.svg" alt={t('profile')} />,
      text: 'profile',
      link: ROUTE_PROFILE,
    },
    {
      icon: <DyoIcon src="/logout.svg" alt={t('logout')} />,
      text: 'logout',
      link: ROUTE_LOGOUT,
    },
  ]

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
        <div className="mt-12 flex text-bright">
          <NavButton
            href={ROUTE_DASHBOARD}
            icon={<Image src="/dashboard.svg" alt={t('dashboard')} width={18} height={18} />}
          >
            {t('dashboard')}
          </NavButton>
        </div>

        <NavSection className="mt-6" title={t('product')} options={productOptions} />

        <NavSection className="mt-12" title={t('components')} options={componentOptions} />

        <NavSection className="mt-auto mb-4" title={t('settings')} options={settingsOptions} />
      </div>
    </div>
  )
}
