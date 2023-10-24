import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import ApplyTemplateCard from '@app/components/templates/apply-template-card'
import TemplateCard from '@app/components/templates/template-card'
import DyoButton from '@app/elements/dyo-button'
import DyoWrap from '@app/elements/dyo-wrap'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { Template } from '@app/models'
import { appendTeamSlug } from '@app/providers/team-routes'
import { API_TEMPLATES, ROUTE_INDEX, ROUTE_TEMPLATES } from '@app/routes'
import { redirectTo, teamSlugOrFirstTeam, withContextAuthorization } from '@app/utils'
import { getCruxFromContext } from '@server/crux-api'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface TemplatesPageProps {
  templates: Template[]
}

const TemplatesPage = (props: TemplatesPageProps) => {
  const { templates } = props

  const { t } = useTranslation('templates')
  const router = useRouter()
  const routes = useTeamRoutes()

  const [applying, setApplying] = useState<Template | null>(null)
  const submit = useSubmit()

  const pageLink: BreadcrumbLink = {
    name: t('common:templates'),
    url: ROUTE_TEMPLATES,
  }

  const onCreate = (template: Template) => {
    setApplying(template)

    // Scroll to the top of the page after selected a template
    window.scrollTo(0, 0)
  }

  const onTemplateApplied = async projectId => {
    setApplying(null)
    await router.push(routes.project.details(projectId))
  }

  return (
    <Layout title={t('common:templates')}>
      <PageHeading pageLink={pageLink}>
        {applying && (
          <>
            <DyoButton className="ml-auto px-4" secondary onClick={() => setApplying(null)}>
              {t('common:discard')}
            </DyoButton>
            <DyoButton className="px-4 ml-4" onClick={() => submit.trigger()}>
              {t('common:add')}
            </DyoButton>
          </>
        )}
      </PageHeading>

      {applying && <ApplyTemplateCard template={applying} onTemplateApplied={onTemplateApplied} submit={submit} />}

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
  const templates = await getCruxFromContext<Template[]>(context, API_TEMPLATES)

  const teamSlug = await teamSlugOrFirstTeam(context)
  if (!teamSlug) {
    return redirectTo(ROUTE_INDEX)
  }

  return {
    props: appendTeamSlug(teamSlug, {
      templates,
    }),
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
