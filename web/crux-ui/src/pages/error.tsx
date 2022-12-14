import { SingleFormLayout } from '@app/components/layout'
import DyoButton from '@app/elements/dyo-button'
import { ROUTE_INDEX } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { FlowError } from '@ory/kratos-client'
import kratos from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'

interface Error {
  message?: string
}

const ErrorPage = (props: FlowError) => {
  const { error: propsError } = props

  const { t } = useTranslation('errors')
  const router = useRouter()

  const error = propsError && 'message' in propsError ? (propsError as Error) : null

  const onGoBack = () => router.back()

  return (
    <SingleFormLayout title={t('oops')}>
      <div className="container mx-auto px-6 w-full max-w-2xl md:max-w-5xl lg:max-w-7xl text-center my-20">
        <h2 className="text-4xl font-extrabold text-blue">{t('oops')}</h2>

        <div className="my-4 text-center text-purple-lightText font-semibold">{error?.message}</div>

        <DyoButton onClick={onGoBack}>{t('common:goBack')}</DyoButton>

        <div className="mt-16" />
      </div>
    </SingleFormLayout>
  )
}

export default ErrorPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const id = context.query.id as string
  if (!id) {
    return redirectTo(ROUTE_INDEX)
  }

  const res = await kratos.getFlowError({
    id,
  })

  return {
    props: res.data,
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
