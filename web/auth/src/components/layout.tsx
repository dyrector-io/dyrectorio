import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { API_AUTH_LOGOUT } from '@app/const'
import { LogoutDto } from '@server/models'
import { DyoHead } from './dyo-head'
import DyoImage from './dyo-image'
import { Header } from './header'
import { MobileNavbar, Navbar } from './navbar'

export interface LayoutProps {
  children: React.ReactNode
}

export const Layout = (props: LayoutProps) => {
  const [navbarOpen, setNavbarOpen] = useState(false)

  const { t } = useTranslation('common')

  const onLogout = async () => {
    const res = await fetch(API_AUTH_LOGOUT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (res.ok) {
      const dto = (await res.json()) as LogoutDto
      window.location.assign(dto.url)
    } else {
      toast(t('errors:oops'))
    }
  }

  return (
    <>
      <DyoHead />

      <Header className="md:fixed transform-gpu bg-white z-10 w-full">
        <Link href="/">
          <a>
            <DyoImage
              src="/dyrector_io_logo.svg"
              width={183}
              height={41.69}
              alt="dyrector.io's dark logo"
            />
          </a>
        </Link>

        <div className="hidden md:block">
          <Navbar onLogout={onLogout} />
        </div>

        <div className="block md:hidden">
          <button onClick={() => setNavbarOpen(!navbarOpen)}>
            {navbarOpen ? (
              <DyoImage
                src="/menu-close-icon.svg"
                width={24}
                height={24}
                alt="menu close icon"
              />
            ) : (
              <DyoImage
                src="/menu-icon.svg"
                width={24}
                height={24}
                alt="menu icon"
              />
            )}
          </button>
        </div>
      </Header>

      {navbarOpen ? (
        <MobileNavbar onLogout={onLogout} />
      ) : (
        <>
          <main className="m-auto max-w-screen-2xl pt-8 md:pt-32">
            {/* <Cookie /> */}

            <Toaster />

            {props.children}
          </main>

          {/* <Footer/> */}
        </>
      )}
    </>
  )
}

export const SingleFormLayout = (props: LayoutProps) => {
  return (
    <>
      <DyoHead />

      <main>
        <Toaster />

        <div className="flex justify-center">
          <div className="flex-col">
            <div className="flex justify-center mt-24 mb-12">
              <DyoImage src="/dyrector_io_logo.svg" width={233} height={54} />
            </div>

            {props.children}
          </div>
        </div>
      </main>
    </>
  )
}
