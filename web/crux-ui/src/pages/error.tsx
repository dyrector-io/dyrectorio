import { SingleFormLayout } from '@app/components/layout'
import { DyoButton } from '@app/elements/dyo-button'
import { DyoContainer } from '@app/elements/dyo-container'
import { ROUTE_INDEX } from '@app/routes'
import { redirectTo, withContextAuthorization } from '@app/utils'
import { SelfServiceError } from '@ory/kratos-client'
import kratos from '@server/kratos'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'

interface Error {
  message?: string
}

const ErrorPage = (props: SelfServiceError) => {
  const { t } = useTranslation('errors')
  const router = useRouter()

  const error = props.error && 'message' in props.error ? (props.error as Error) : null

  const onGoBack = () => router.back()

  return (
    <SingleFormLayout title={t('oops')}>
      <DyoContainer className="text-center my-20">
        <h2 className="text-4xl font-extrabold text-blue">{t('oops')}</h2>

        <div className="my-4 text-center text-purple-lightText font-semibold">{error?.message}</div>

        <DyoButton onClick={onGoBack}>{t('common:goBack')}</DyoButton>

        <div className="mt-16"></div>
      </DyoContainer>
    </SingleFormLayout>
  )
}

export default ErrorPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const id = context.query.id as string
  if (!id) {
    return redirectTo(ROUTE_INDEX)
  }

  const res = await kratos.getSelfServiceError(id)

  return {
    props: res.data,
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
