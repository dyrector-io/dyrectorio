import { TOAST_DURATION } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoTextArea from '@app/elements/dyo-text-area'
import DyoToggle from '@app/elements/dyo-toggle'
import { apiErrorHandler, defaultTranslator } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  CreateDeployment,
  Deployment,
  DyoApiError,
  DyoNode,
  Project,
  Version,
  deploymentHasError,
  projectNameToDeploymentPrefix,
} from '@app/models'
import { fetcher, sendForm } from '@app/utils'
import { createFullDeploymentSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import useSWR from 'swr'
import SelectProjectChips from '../projects/select-project-chips'

interface AddDeploymentCardProps {
  className?: string
  onAdd: (deploymentId: string) => void
  onDiscard: VoidFunction
}

const AddDeploymentCard = (props: AddDeploymentCardProps) => {
  const { className, onAdd, onDiscard } = props

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  const { data: nodes, error: fetchNodesError } = useSWR<DyoNode[]>(routes.node.api.list(), fetcher)

  const handleApiError = apiErrorHandler((stringId: string, status: number, dto: DyoApiError) => {
    if (deploymentHasError(dto)) {
      onAdd(dto.value)

      return {
        toast: dto.description,
        toastOptions: {
          className: '!bg-warning-orange',
          duration: TOAST_DURATION,
        },
      }
    }

    return defaultTranslator(t)(stringId, status, dto)
  })

  const formik = useDyoFormik({
    initialValues: {
      nodeId: null as string,
      note: '',
      prefix: '',
      protected: false,
      versionId: null as string,
      project: null as Project,
    },
    validationSchema: createFullDeploymentSchema,
    t,
    onSubmit: async (values, { setFieldError }) => {
      const body: CreateDeployment = {
        ...values,
      }

      const res = await sendForm('POST', routes.deployment.api.list(), body)

      if (res.ok) {
        const result = (await res.json()) as Deployment
        onAdd(result.id)
      } else if (res.status === 409) {
        // Handle preparing deployment exists or rolling version has deployment errors
        await handleApiError(res.clone())
      } else {
        await handleApiError(res, setFieldError)
      }
    },
  })

  const { data: versions, error: fetchVersionsError } = useSWR<Version[]>(
    formik.values.project ? routes.project.versions(formik.values.project.id).api.list() : null,
    fetcher,
  )

  const { setFieldValue: formikSetFieldValue, setFieldError: formikSetFieldError, values: formikValues } = formik

  useEffect(() => {
    if (nodes?.length === 1 && !formikValues.nodeId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formikSetFieldValue('nodeId', nodes[0].id)
    }
  }, [nodes, formikValues.nodeId, formikSetFieldValue])

  useEffect(() => {
    if (versions?.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formikSetFieldValue('versionId', versions[0].id)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formikSetFieldValue('versionId', null)
    }
    formikSetFieldError('versionId', null)
  }, [versions, formikSetFieldValue, formikSetFieldError])

  const onProjectsFetched = (projects: Project[] | null) => {
    if (projects?.length === 1) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formikSetFieldValue('project', projects[0])
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formikSetFieldValue('prefix', projectNameToDeploymentPrefix(projects[0].name))
    }
  }

  const currentProject = formik.values.project

  return (
    <DyoCard className={className}>
      <div className="flex flex-row">
        <DyoHeading element="h4" className="text-lg text-bright">
          {t('addDeployment')}
        </DyoHeading>

        <DyoButton outlined secondary className="ml-auto mr-2 px-10" onClick={onDiscard}>
          {t('common:discard')}
        </DyoButton>

        <DyoButton outlined className="ml-2 px-10" onClick={formik.submitForm}>
          {t('common:add')}
        </DyoButton>
      </div>

      <div className="flex flex-col">
        <DyoLabel className="mt-8 mb-2.5">{t('common:nodes')}</DyoLabel>
        {fetchNodesError ? (
          <DyoLabel>
            {t('errors:fetchFailed', {
              type: t('common:nodes'),
            })}
          </DyoLabel>
        ) : !nodes ? (
          <DyoLabel>{t('common:loading')}</DyoLabel>
        ) : nodes.length === 0 ? (
          <DyoMessage message={t('common:noNameFound', { name: t('common:nodes') })} messageType="error" />
        ) : (
          <>
            <DyoChips
              name="nodes"
              choices={nodes ?? []}
              converter={(it: DyoNode) => it.name}
              selection={nodes.find(it => it.id === formik.values.nodeId)}
              onSelectionChange={it => formik.setFieldValue('nodeId', it.id)}
            />
            {formik.errors.nodeId && <DyoMessage message={formik.errors.nodeId} messageType="error" />}
          </>
        )}

        <DyoLabel className="mt-8 mb-2.5">{t('common:projects')}</DyoLabel>

        <SelectProjectChips
          name="projects"
          selection={currentProject}
          onSelectionChange={async it => {
            await formik.setFieldValue('project', it)
            await formik.setFieldValue('prefix', projectNameToDeploymentPrefix(it.name))
          }}
          errorMessage={formik.errors.project as string}
          onProjectsFetched={onProjectsFetched}
        />

        {currentProject && (
          <>
            {currentProject.type === 'versioned' && <DyoLabel className="mt-8">{t('common:versions')}</DyoLabel>}
            {fetchVersionsError ? (
              <DyoLabel>
                {t('errors:fetchFailed', {
                  type: t('common:versions'),
                })}
              </DyoLabel>
            ) : !versions && formik.values.project ? (
              <DyoLabel>{t('common:loading')}</DyoLabel>
            ) : versions.length === 0 ? (
              <DyoMessage message={t('noVersions')} />
            ) : (
              currentProject.type === 'versioned' && (
                <>
                  <DyoChips
                    name="versions"
                    choices={versions ?? []}
                    converter={(it: Version) => it.name}
                    selection={versions?.find(it => it.id === formik.values.versionId)}
                    onSelectionChange={async it => {
                      await formik.setFieldValue('versionId', it.id)
                    }}
                  />
                  {formik.errors.versionId && !formik.values.versionId && (
                    <DyoMessage message={formik.errors.versionId} messageType="error" />
                  )}
                </>
              )
            )}
          </>
        )}

        <DyoInput
          className="max-w-lg"
          grow
          name="prefix"
          required
          label={t('common:prefix')}
          onChange={formik.handleChange}
          value={formik.values.prefix}
          message={formik.errors.prefix}
        />

        <DyoToggle
          className="mt-8 mb-2.5"
          name="protected"
          label={t('protected')}
          checked={formik.values.protected}
          setFieldValue={formik.setFieldValue}
        />

        <DyoTextArea
          className="h-48"
          grow
          name="note"
          label={t('common:note')}
          onChange={formik.handleChange}
          value={formik.values.note}
        />
      </div>
    </DyoCard>
  )
}

export default AddDeploymentCard
