import ComposeEnvironment from '@app/components/composer/compose-environment'
import ComposeFileCard from '@app/components/composer/compose-file-card'
import ConvertedContainerCard from '@app/components/composer/converted-container'
import DotEnvFileCard from '@app/components/composer/dot-env-file-card'
import GenerateVersionCard from '@app/components/composer/generate-version-card'
import useComposerState, {
  activateBottomSection,
  activateUpperSection,
  addEnvFile,
  convertComposeFile,
  convertEnvFile,
  selectDefaultEnvironment,
  selectShowDefaultEnvironment,
  toggleShowDefaultDotEnv,
} from '@app/components/composer/use-composer-state'
import { Layout } from '@app/components/layout'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import DyoButton from '@app/elements/dyo-button'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoToggle from '@app/elements/dyo-toggle'
import DyoWrap from '@app/elements/dyo-wrap'
import useSubmit from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { DotEnvironment, Project, Registry, VersionDetails, findRegistryByUrl, imageUrlOfImageName } from '@app/models'
import { appendTeamSlug } from '@app/providers/team-routes'
import { ROUTE_COMPOSER, ROUTE_INDEX } from '@app/routes'
import { fetcher, redirectTo, teamSlugOrFirstTeam, withContextAuthorization } from '@app/utils'
import clsx from 'clsx'
import { GetServerSidePropsContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

const ComposerPage = () => {
  const { t } = useTranslation('compose')
  const router = useRouter()
  const routes = useTeamRoutes()

  const { data: registries, error: fetchRegistriesError } = useSWR<Registry[]>(routes.registry.api.list(), fetcher)
  useEffect(() => {
    if (fetchRegistriesError) {
      toast.error(
        t('errors:fetchFailed', {
          type: t('common:registries'),
        }),
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRegistriesError])

  const [state, dispatch] = useComposerState()
  const showDefaultEnv = selectShowDefaultEnvironment(state)

  const hasRegistry = useCallback(
    (image: string | null) => {
      if (!registries && !image) {
        return false
      }

      const url = imageUrlOfImageName(image)
      return !!findRegistryByUrl(registries, url)
    },
    [registries],
  )

  const missingRegistries = !state.containers.every(it => hasRegistry(it.image))

  const submit = useSubmit()

  const onComposeFileChange = (text: string) => dispatch(convertComposeFile(t, text))
  const onToggleShowDefaultDotEnv = () => dispatch(toggleShowDefaultDotEnv())

  const onEnvFileChange = (target: DotEnvironment, text: string) => dispatch(convertEnvFile(t, target, text))
  const onAddDotEnv = () => dispatch(addEnvFile())

  const onActivateGenerate = () => dispatch(activateUpperSection('generate'))
  const onGenerateVersion = () => submit.trigger()
  const onDiscardVersion = () => dispatch(activateUpperSection('compose'))

  const onVersionGenerated = async (project: Project, version: VersionDetails) => {
    await router.push(routes.project.versions(project.id).details(version.id))
  }

  const defaultDotEnv = selectDefaultEnvironment(state)

  const pageLink: BreadcrumbLink = {
    name: t('common:composer'),
    url: ROUTE_COMPOSER,
  }

  return (
    <Layout title={t('common:composer')}>
      <PageHeading pageLink={pageLink}>
        {state.upperSection === 'compose' ? (
          <DyoButton onClick={onActivateGenerate} disabled={missingRegistries}>
            {t('generate')}
          </DyoButton>
        ) : (
          <>
            <DyoButton className="px-4" secondary onClick={onDiscardVersion}>
              {t('common:discard')}
            </DyoButton>

            <DyoButton className="px-4 ml-4" onClick={onGenerateVersion} disabled={missingRegistries}>
              {t('generate')}
            </DyoButton>
          </>
        )}
      </PageHeading>

      {state.upperSection === 'compose' ? (
        <div className={clsx('grid gap-4', showDefaultEnv ? 'grid-cols-2' : 'grid-cols-1')}>
          <ComposeFileCard
            errorMessage={state.compose?.error}
            initialText={state.compose?.text}
            onChange={onComposeFileChange}
          />

          {showDefaultEnv && (
            <DotEnvFileCard dotEnv={defaultDotEnv} onEnvChange={text => onEnvFileChange(defaultDotEnv, text)} />
          )}
        </div>
      ) : (
        <GenerateVersionCard
          submit={submit}
          registries={registries}
          containers={state.containers}
          onVersionGenerated={onVersionGenerated}
        />
      )}

      {state.upperSection === 'compose' && (
        <div className="flex flex-row my-4">
          <DyoButton
            text
            thin
            underlined={state.bottomSection === 'containers'}
            textColor="text-bright"
            className="mx-6"
            onClick={() => dispatch(activateBottomSection('containers'))}
          >
            {t('common:containers')}
          </DyoButton>

          <DyoButton
            text
            thin
            underlined={state.bottomSection === 'environment'}
            textColor="text-bright"
            className="mx-6"
            onClick={() => dispatch(activateBottomSection('environment'))}
          >
            {t('container:common.environment')}
          </DyoButton>

          <DyoToggle
            hidden={state.bottomSection === 'containers'}
            className="self-center ml-auto mr-4"
            checked={state.showDefaultDotEnv}
            onCheckedChange={onToggleShowDefaultDotEnv}
            label={t('defaultDotEnv')}
          />

          <DyoButton className="ml-4 px-6" onClick={onAddDotEnv}>
            {t('addDotEnv')}
          </DyoButton>
        </div>
      )}

      {state.bottomSection === 'containers' ? (
        state.containers.length > 0 ? (
          <DyoWrap>
            {state.containers.map((it, index) => (
              <ConvertedContainerCard key={`container-${index}`} container={it} hasRegistry={hasRegistry(it.image)} />
            ))}
          </DyoWrap>
        ) : (
          <DyoHeading element="h3" className="text-md text-center align-middle text-light-eased">
            {t('pasteYourCompose')}
          </DyoHeading>
        )
      ) : state.bottomSection === 'environment' ? (
        <ComposeEnvironment state={state} dispatch={dispatch} />
      ) : null}
    </Layout>
  )
}

export default ComposerPage

const getPageServerSideProps = async (context: GetServerSidePropsContext) => {
  const teamSlug = await teamSlugOrFirstTeam(context)
  if (!teamSlug) {
    return redirectTo(ROUTE_INDEX)
  }

  return {
    props: appendTeamSlug(teamSlug, {}),
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
