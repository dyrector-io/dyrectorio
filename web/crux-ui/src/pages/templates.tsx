import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import ApplyTemplateCard from '@app/components/templates/apply-template-card'
import TemplateCard from '@app/components/templates/template-card'
import DyoButton from '@app/elements/dyo-button'
import DyoWrap from '@app/elements/dyo-wrap'
import { Template } from '@app/models'
import { API_TEMPLATES, productUrl, ROUTE_TEMPLATES } from '@app/routes'
import { fetchCrux, withContextAuthorization } from '@app/utils'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

interface TemplatesPageProps {
  templates: Template[]
}

const TemplatesPage = (props: TemplatesPageProps) => {
  const { templates } = props

  const router = useRouter()

  const { t } = useTranslation('templates')

  const [applying, setApplying] = useState<Template | null>(null)
  const submitRef = useRef<() => Promise<any>>()

  const pageLink: BreadcrumbLink = {
    name: t('common:templates'),
    url: ROUTE_TEMPLATES,
  }

  const onCreate = (template: Template) => {
    setApplying(template)

    // Scroll to the top of the page after selected a template
    window.scrollTo(0, 0)
  }

  const onTemplateApplied = async productId => {
    setApplying(null)
    await router.push(productUrl(productId))
  }

  return (
    <Layout title={t('common:templates')}>
      <PageHeading pageLink={pageLink}>
        {applying && (
          <>
            <DyoButton className="ml-auto px-4" secondary onClick={() => setApplying(null)}>
              {t('common:discard')}
            </DyoButton>
            <DyoButton className="px-4 ml-4" onClick={() => submitRef.current()}>
              {t('common:add')}
            </DyoButton>
          </>
        )}
      </PageHeading>

      {applying && (
        <ApplyTemplateCard template={applying} onTemplateApplied={onTemplateApplied} submitRef={submitRef} />
      )}

      <DyoWrap>
        {templates.map(it => (
          <TemplateCard key={it.id} template={it} onAddClick={() => onCreate(it)} />
        ))}
      </DyoWrap>
    </Layout>
  )
}
export default TemplatesPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const res = await fetchCrux(context, API_TEMPLATES)
  const templates = (await res.json()) as Template[]

  return {
    props: {
      templates,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
