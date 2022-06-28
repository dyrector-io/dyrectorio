import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { MouseEventHandler } from 'react'
import useSWR from 'swr'
import {
  API_AUTH_ME,
  ROUTE_ADMIN,
  ROUTE_INDEX,
  ROUTE_SETTINGS,
} from '@app/const'
import { UserDto } from '@server/models'
import { configuredFetcher } from '@app/utils'
import { DyoButton } from './dyo-button'
import { NavButton } from './nav-button'

interface NavbarProps {
  onLogout: MouseEventHandler<HTMLButtonElement>
}

export const Navbar = (props: NavbarProps) => {
  const { t } = useTranslation('common')

  const { data, error } = useSWR<UserDto, any>(
    API_AUTH_ME,
    configuredFetcher({
      method: 'POST',
    }),
  )
  const admin = !error && data && data.admin

  return (
    <nav className="flex flex-row items-center space-x-14 justify-between">
      <ul className="list-none flex flex-row space-x-14 p-3">
        <li>
          <NavButton className="mx5" href={ROUTE_INDEX}>
            {t('common:home')}
          </NavButton>
        </li>
        <li>
          <NavButton className="mx5" href={ROUTE_SETTINGS}>
            {t('common:settings')}
          </NavButton>
        </li>
        {!admin ? null : (
          <li>
            <NavButton className="mx5" href={ROUTE_ADMIN}>
              {t('common:admin')}
            </NavButton>
          </li>
        )}
      </ul>

      <div className="space-x-6">
        <DyoButton secondary className="px-8" onClick={props.onLogout}>
          {t('common:logOut')}
        </DyoButton>
      </div>
    </nav>
  )
}

export const MobileNavbar = (props: NavbarProps) => {
  const { t } = useTranslation('common')

  return (
    <aside className="bg-white z-11 w-full fixed text-center font-poppins text-xl text-gray-dark font-semibold">
      <nav className="flex flex-col mt-16 sm:mt-32">
        <ul className="flex flex-col list-none space-y-8">
          <li>
            <Link href="/">{t('home')}</Link>
          </li>
          <li>
            <Link href="/settings">{t('settings')}</Link>
          </li>
        </ul>

        <div className="flex justify-center mt-16 sm:mt-32 space-x-6">
          <button
            className="text-dyo-shadowed-purple font-semibold"
            onClick={props.onLogout}
          >
            {t('common:logOut')}
          </button>
        </div>
      </nav>
    </aside>
  )
}
