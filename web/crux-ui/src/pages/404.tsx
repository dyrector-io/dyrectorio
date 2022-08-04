import { PageHead } from '@app/components/layout'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoHeading } from '@app/elements/dyo-heading'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRouter } from 'next/router'

const Page404 = () => {
  const { t } = useTranslation('404')
  const router = useRouter()

  const goBack = () => router.back()

  return (
    <>
      <PageHead title={t('title')} />
      <div className="flex flex-row min-h-screen bg-dark">
        <div className="flex flex-col items-center w-full my-auto">
          <div>
            <Image src="/404.svg" alt={t('notFound')} width={500} height={346.833} />
          </div>

          <DyoHeading element="h2" className="text-4xl text-white font-extrabold mt-16">
            {t('oops')}
          </DyoHeading>

          <p className="text-center text-light font-semibold my-6">{t('nothingYet')}</p>

          <DyoButton secondary outlined onClick={goBack}>
            {t('common:goBack')}
          </DyoButton>
        </div>
      </div>
    </>
  )
}

export default Page404
