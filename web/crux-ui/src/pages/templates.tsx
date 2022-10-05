import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { ListPageMenu } from '@app/components/shared/page-menu'
import ApplyTemplateCard from '@app/components/templates/apply-template-card'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoWrap from '@app/elements/dyo-wrap'
import { Template } from '@app/models/template'
import { ROUTE_TEMPLATES } from '@app/routes'

import { withContextAuthorization } from '@app/utils'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import { useRef, useState } from 'react'

interface TemplatesPageProps {
  templates: Template[]
}

const TemplatesPage = (props: TemplatesPageProps) => {
  const { templates } = props

  const { t } = useTranslation('products')

  const [applying, setApplying] = useState<Template | null>(null)
  const submitRef = useRef<() => Promise<any>>()

  const pageLink: BreadcrumbLink = {
    name: t('common:templates'),
    url: ROUTE_TEMPLATES,
  }

  const onCreate = (template: Template) => {
    setApplying(template)
  }

  return (
    <Layout title={t('common:templates')}>
      <PageHeading pageLink={pageLink}>
        {applying && <>
          <DyoButton className="ml-auto px-4" secondary onClick={() => setApplying(null)}>
            {t('common:discard')}
          </DyoButton>

          <DyoButton className="px-4 ml-4" onClick={() => submitRef.current()}>
            {t('common:add')}
          </DyoButton>
        </>}
      </PageHeading>

      {applying && <ApplyTemplateCard template={applying} onTemplateApplied={() => setApplying(null)} submitRef={submitRef} />}

      <DyoWrap>
        {templates.map(it => (<DyoCard className="p-6 flex flex-col flex-grow w-full">
          <div className="flex flex-col w-full">
            <div className="flex flex-row">
              <Image
                src="/default_template.svg"
                width={100}
                height={100}
              />

              <div className="flex flex-col flex-grow">
                <DyoHeading element="h5" className="text-lg text-bright ml-4">
                  {it.name}
                </DyoHeading>
              </div>

              <DyoButton className="ml-auto px-4" onClick={() => onCreate(it)}>{t('common:add')}</DyoButton>
            </div>

            <p className="text-md text-bright mt-4 line-clamp-2 break-words">{it.description}</p>
          </div>
        </DyoCard>))}
      </DyoWrap>
    </Layout>
  )
}
export default TemplatesPage

const getPageServerSideProps = async (context: NextPageContext) => ({
  props: {
    templates: await cruxFromContext(context).templates.getAll()
  },
})

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
