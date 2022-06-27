import '@app/styles/global.css'
import { AppProps } from 'next/app'

const CruxApp = ({ Component, pageProps }: AppProps) => (
  <>
    <Component {...pageProps} />
  </>
)

export default CruxApp
