import { WebSocketProvider } from '@app/providers/websocket'
import '@app/styles/global.css'
import { AppProps } from 'next/app'
import { DyoHead } from '../components/main/dyo-head'

const CruxApp = ({ Component, pageProps }: AppProps) => (
  <>
    <DyoHead />
    <WebSocketProvider>
      <Component {...pageProps} />
    </WebSocketProvider>
  </>
)

export default CruxApp
