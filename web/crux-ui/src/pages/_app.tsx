import DyoHead from '@app/components/main/dyo-head'
import { WebSocketProvider } from '@app/providers/websocket'
import '@app/styles/global.css'
import { AppProps } from 'next/app'

const CruxApp = ({ Component, pageProps }: AppProps) => (
  <>
    <DyoHead />
    <WebSocketProvider>
      <Component {...pageProps} />
    </WebSocketProvider>
  </>
)

export default CruxApp
