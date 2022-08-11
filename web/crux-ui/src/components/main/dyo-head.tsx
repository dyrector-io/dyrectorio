import useTranslation from 'next-translate/useTranslation'
import Head from 'next/head'

export const DyoHead = () => {
  const { t } = useTranslation('head')

  return (
    <Head>
      <meta charSet="utf-8" />
      <title>{t('defaultTitle')}</title>
      <meta name="description" content={t('description')} />
      <meta property="og:title" content="dyrector.io" />
      <meta property="og:type" content="article" />
      <meta property="og:url" content="https://dyrector.io" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        property="og:image"
        content="https://dyrector.io/static/809f32056da442775de4876cfb542903/c3cd8/home-hero-illustration.webp"
      />
      <meta property="og:description" content={t('ogDescription')} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://dyrector.io" />
    </Head>
  )
}
