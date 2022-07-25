import '@app/styles/global.css'
import { AppProps } from 'next/app'
import { DyoHead } from '../components/main/dyo-head'

const CruxApp = ({ Component, pageProps }: AppProps) => (
  <>
    <DyoHead />
    <Component {...pageProps} />
  </>
)

export default CruxApp
