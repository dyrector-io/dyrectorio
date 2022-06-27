import { SelfServiceError } from '@ory/kratos-client'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { DyoButton } from '../components/dyo-button'
import { DyoContainer } from '../components/dyo-container'
import { ROUTE_INDEX } from '@app/const'
import kratos from '@server/kratos'
import { redirectTo } from '@app/utils'

interface Error {
  message?: string
}

const ErrorPage = (props: SelfServiceError) => {
  const { t } = useTranslation('errors')
  const router = useRouter()

  const error =
    props.error && 'message' in props.error ? (props.error as Error) : null

  return (
    <>
      <DyoContainer className="text-center my-20">
        <h2 className="text-4xl font-extrabold text-blue">{t('oops')}</h2>

        <div className="my-4 text-center text-purple-lightText font-semibold">
          {error?.message}
        </div>

        <DyoButton onClick={() => router.back()}>
          {t('common:goBack')}
        </DyoButton>

        <div className="mt-16"></div>
      </DyoContainer>
    </>
  )
}

export default ErrorPage

export async function getServerSideProps(context: NextPageContext) {
  const id = context.query['id'] as string
  if (!id) {
    return redirectTo(ROUTE_INDEX)
  }

  const error = await kratos.getSelfServiceError(id)

  return {
    props: error.data,
  }
}
