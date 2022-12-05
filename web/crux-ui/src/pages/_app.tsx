import DyoHead from '@app/components/main/dyo-head'
import { WebSocketProvider } from '@app/providers/websocket'
import '@app/styles/global.css'
import { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'

const CruxApp = ({ Component, pageProps }: AppProps) => (
  <>
    <DyoHead />
    <WebSocketProvider>
      <Toaster
        toastOptions={{
          error: {
            icon: null,
            className: '!bg-error-red',
            style: {
              color: 'white',
            },
            position: 'top-right',
          },
        }}
      />
      <Component {...pageProps} />
    </WebSocketProvider>
  </>
)

export default CruxApp
