import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import DyoTextArea from '@app/elements/dyo-text-area'
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
  projectNameToDeploymentPrefix,
} from '@app/models'
import { fetcher, sendForm } from '@app/utils'
import { createFullDeploymentSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'

interface AddDeploymentCardProps {
  className?: string
  onAdd: (deploymentId: string) => void
  onDiscard: VoidFunction
}

const AddDeploymentCard = (props: AddDeploymentCardProps) => {
  const { className, onAdd, onDiscard } = props

  const { t } = useTranslation('deployments')
  const routes = useTeamRoutes()

  const [projectId, SetProjectId] = useState('')

  const { data: nodes, error: fetchNodesError } = useSWR<DyoNode[]>(routes.node.api.list(), fetcher)
  const { data: projects, error: fetchProjectsError } = useSWR<Project[]>(routes.project.api.list(), fetcher)
  const { data: versions, error: fetchVersionsError } = useSWR<Version[]>(
    routes.project.versions(projectId).api.list(),
    fetcher,
  )

  const currentProject = projects?.find(it => it.id === projectId)

  const handleApiError = apiErrorHandler((stringId: string, status: number, dto: DyoApiError) => {
    if (dto.error === 'rollingVersionDeployment' || dto.error === 'alreadyHavePreparing') {
      onAdd(dto.value)

      return {
        toast: dto.description,
        toastOptions: {
          className: '!bg-warning-orange',
          duration: 5000,
        },
      }
    }

    return defaultTranslator(t)(stringId, status, dto)
  })

  const formik = useDyoFormik({
    initialValues: {
      nodeId: '',
      note: '',
      prefix: '',
      versionId: '',
    },
    validationSchema: createFullDeploymentSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const transformedValues = createFullDeploymentSchema.cast(values) as any

      const body: CreateDeployment = {
        ...values,
      }

      const res = await sendForm('POST', routes.deployment.api.list(), body)

      if (res.ok) {
        const result = (await res.json()) as Deployment
        onAdd(result.id)
      } else if (res.status === 409) {
        // Handle preparing deployment exists or rolling version has deployment errors
        handleApiError(res.clone())
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

  useEffect(() => {
    if (nodes && nodes.length < 1) {
      toast.error(t('nodeRequired'))
    }
    if (nodes?.length === 1 && !formik.values.nodeId) {
      formik.setFieldValue('nodeId', nodes[0].id)
    }
  }, [nodes, t])

  useEffect(() => {
    if (projects && projects.length < 1) {
      toast.error(t('projectRequired'))
    }
    if (projects?.length === 1 && !projectId) {
      SetProjectId(projects[0].id)
      formik.setFieldValue('prefix', projectNameToDeploymentPrefix(projects[0].name))
    }
  }, [projects])

  useEffect(() => {
    if (versions?.length === 1) {
      formik.setFieldValue('versionId', versions[0].id)
    }
  }, [versions, projectId])

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

      {fetchNodesError ? (
        <DyoLabel>
          {t('errors:fetchFailed', {
            type: t('common:nodes'),
          })}
        </DyoLabel>
      ) : !nodes ? (
        <DyoLabel>{t('common:loading')}</DyoLabel>
      ) : (
        <div className="flex flex-col">
          <DyoLabel className="mt-8 mb-2.5">{t('common:nodes')}</DyoLabel>

          <DyoChips
            choices={nodes ?? []}
            converter={(it: DyoNode) => it.name}
            selection={nodes.find(it => it.id === formik.values.nodeId)}
            onSelectionChange={it => formik.setFieldValue('nodeId', it.id)}
          />
          {!formik.errors.nodeId ? null : <DyoMessage message={formik.errors.nodeId} messageType="error" />}

          {fetchProjectsError ? (
            <DyoLabel>
              {t('errors:fetchFailed', {
                type: t('common:projects'),
              })}
            </DyoLabel>
          ) : (
            <>
              <DyoLabel className="mt-8 mb-2.5">{t('common:projects')}</DyoLabel>
              {!projects ? (
                <DyoLabel>{t('common:loading')}</DyoLabel>
              ) : (
                <>
                  <DyoChips
                    choices={projects ?? []}
                    converter={(it: Project) => it.name}
                    selection={currentProject}
                    onSelectionChange={it => {
                      SetProjectId(it.id)
                      formik.setFieldValue('prefix', projectNameToDeploymentPrefix(it.name))
                    }}
                  />
                  {fetchProjectsError ? (
                    <DyoLabel>
                      {t('errors:fetchFailed', {
                        type: t('common:projects'),
                      })}
                    </DyoLabel>
                  ) : (
                    <>
                      {currentProject?.type === 'versioned' && (
                        <>
                          <DyoLabel className="mt-8">{t('common:versions')}</DyoLabel>
                          <DyoChips
                            choices={versions ?? []}
                            converter={(it: Version) => it.name}
                            selection={(versions ?? []).find(it => it.id === formik.values.versionId)}
                            onSelectionChange={it => {
                              formik.setFieldValue('versionId', it.id)
                            }}
                          />
                        </>
                      )}
                      {!formik.errors.versionId ? null : (
                        <DyoMessage message={formik.errors.versionId} messageType="error" />
                      )}
                    </>
                  )}
                </>
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

          <DyoTextArea
            className="h-48"
            grow
            name="note"
            label={t('common:note')}
            onChange={formik.handleChange}
            value={formik.values.note}
          />
        </div>
      )}
    </DyoCard>
  )
}

export default AddDeploymentCard
