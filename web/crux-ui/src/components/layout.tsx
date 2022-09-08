import { UserMeta } from '@app/models'
import { API_WHOAMI, ROUTE_LOGIN } from '@app/routes'
import { configuredFetcher } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import useSWR from 'swr'
import Footer from './main/footer'
import { Sidebar } from './main/sidebar'
import Topbar from './main/top-bar'

const sidebarWidth = 'w-[17rem]'
const mainWidth = 'w-[calc(100vw-20rem)]' // ViewWidth - sidebar

interface PageHeadProps {
  title: string
}

const PageHead = (props: PageHeadProps) => {
  const { t } = useTranslation('head')

  const { title } = props

  return (
    <Head>
      <title>{t('title', { page: title })}</title>
    </Head>
  )
}

export interface LayoutProps {
  title: string
  children: React.ReactNode
}

export const Layout = (props: LayoutProps) => {
  const { title, children } = props

  const { data: meta, error } = useSWR<UserMeta>(
    API_WHOAMI,
    configuredFetcher({
      method: 'POST',
    }),
  )

  const router = useRouter()
  if (error) {
    router.replace(ROUTE_LOGIN)
  }

  return (
    <>
      <PageHead title={title} />
      <main className="flex flex-row h-full bg-dark w-full">
        <Toaster
          toastOptions={{
            error: {
              icon: null,
              className: '!bg-error-red',
              style: {
                color: 'white',
              },
            },
          }}
        />

        <Sidebar className={clsx('flex flex-col bg-medium h-screen sticky top-0', sidebarWidth)} />

        <div className={clsx('flex flex-col px-7 pt-4', mainWidth)}>
          <Topbar className="flex flex-row mb-4" meta={meta} />

          <div className="flex flex-col h-full">{children}</div>

          <Footer className="mt-auto" />
        </div>
      </main>
    </>
  )
}

export const SingleFormLayout = (props: LayoutProps) => {
  const { title, children } = props

  return (
    <>
      <PageHead title={title} />

      <main className="flex flex-row h-full bg-dark">
        <Toaster
          toastOptions={{
            error: {
              icon: null,
              className: '!bg-error-red',
              style: {
                color: 'white',
              },
            },
          }}
        />

        <div className="h-screen" />

        <div className="flex flex-col w-full px-7 pt-4">
          <div className="flex flex-col h-full">{children}</div>

          <Footer className="mt-auto" />
        </div>
      </main>
    </>
  )
}
