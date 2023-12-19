import DyoHead from '@app/components/main/dyo-head'
import usePosthog from '@app/hooks/use-posthog'
import { TeamRoutesProvider } from '@app/providers/team-routes'
import { WebSocketProvider } from '@app/providers/websocket'
import '@app/styles/global.css'
import { AppProps } from 'next/app'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { Toaster } from 'react-hot-toast'

const CruxApp = ({ Component, pageProps }: AppProps) => {
  usePosthog(pageProps)

  return (
    <>
      <DyoHead />

      <PostHogProvider client={posthog}>
        <WebSocketProvider>
          <TeamRoutesProvider pageProps={pageProps}>
            <Toaster
              toastOptions={{
                error: {
                  icon: null,
                  className: '!bg-error-red',
                  style: {
                    color: 'white',
                  },
                  position: 'top-center',
                },
              }}
            />

            <Component {...pageProps} />
          </TeamRoutesProvider>
        </WebSocketProvider>
      </PostHogProvider>
    </>
  )
}

export default CruxApp
