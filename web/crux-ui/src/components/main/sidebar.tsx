import {
  ROUTE_DEPLOYMENTS,
  ROUTE_INDEX,
  ROUTE_LOGOUT,
  ROUTE_NODES,
  ROUTE_NOTIFICATIONS,
  ROUTE_PRODUCTS,
  ROUTE_PROFILE,
  ROUTE_REGISTRIES,
  ROUTE_TEAMS_ACTIVE,
  ROUTE_TEAMS_AUDIT,
} from '@app/routes'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'
import { NavSection } from './nav-section'

export interface SidebarProps {
  className?: string
}

export const Sidebar = (props: SidebarProps) => {
  const { t } = useTranslation('common')

  const productOptions = [
    {
      icon: <Image src="/products.svg" alt={t('product')} width={18} height={18} />,
      text: 'product',
      link: ROUTE_PRODUCTS,
    },
    {
      icon: <Image src="/deployment.svg" alt={t('deployment')} width={18} height={18} />,
      text: 'deployment',
      link: ROUTE_DEPLOYMENTS,
    },
  ]

  const configOptions = [
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
      icon: <Image src="/notification.svg" alt={t('notification')} width={18} height={18} />,
      text: 'notifications',
      link: ROUTE_NOTIFICATIONS,
    },
  ]

  const settingsOptions = [
    {
      icon: <Image src="/audit.svg" alt={t('audit')} width={18} height={18} />,
      text: 'audit',
      link: ROUTE_TEAMS_AUDIT,
    },
    {
      icon: <Image src="/team.svg" alt={t('team')} width={18} height={18} />,
      text: 'team',
      link: ROUTE_TEAMS_ACTIVE,
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
    <div className={props.className}>
      <div className="mx-12">
        <Link href={ROUTE_INDEX}>
          <a>
            <Image
              className="cursor-pointer"
              src="/dyrector_io_logo_white.svg"
              alt={t('dyoWhiteLogo')}
              width={200}
              height={80}
            />
          </a>
        </Link>
      </div>

      <div className="flex flex-col flex-grow px-6 pb-4">
        <NavSection className="mt-12" title={t('product')} options={productOptions} />

        <NavSection className="mt-12" title={t('config')} options={configOptions} />

        <NavSection className="mt-auto mb-4" title={t('settings')} options={settingsOptions} />
      </div>
    </div>
  )
}
