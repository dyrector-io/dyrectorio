import useTranslation from 'next-translate/useTranslation'
import DyoImage from '../components/dyo-image'
import Link from 'next/link'
import React from 'react'
import { DyoButton } from '../components/dyo-button'
import { DyoContainer } from '../components/dyo-container'

const Page404 = () => {
  const { t } = useTranslation('404')

  return (
    <>
      <DyoContainer className="text-center my-20">
        <div className="flex justify-center mb-16">
          <DyoImage src="/404.svg" width={500} height={346.833} />
        </div>

        <h2 className="text-4xl font-extrabold text-blue">{t('oops')}</h2>

        <div className="my-4 text-center text-purple-lightText font-semibold">
          {t('nothingYet')}
        </div>

        <Link href="/">
          <DyoButton>{t('common:goBack')}</DyoButton>
        </Link>

        <div className="mt-16"></div>
      </DyoContainer>
    </>
  )
}

export default Page404
