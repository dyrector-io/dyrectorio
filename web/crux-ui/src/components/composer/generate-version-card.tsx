import { DyoCard } from '@app/elements/dyo-card'
import DyoChips, { chipsQALabelFromValue } from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import LoadingIndicator from '@app/elements/loading-indicator'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { SubmitHook } from '@app/hooks/use-submit'
import useTeamRoutes from '@app/hooks/use-team-routes'
import {
  AddImages,
  COMPOSE_TARGET_TYPE_VALUES,
  ComposeGenerateVersion,
  ConvertedContainer,
  CreateProject,
  CreateVersion,
  Project,
  ProjectDetails,
  Registry,
  VERSION_TYPE_VALUES,
  VersionDetails,
  findRegistryByUrl,
  imageUrlOfImageName as imageUrlOfImageTag,
} from '@app/models'
import { sendForm } from '@app/utils'
import { generateVersionSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import toast from 'react-hot-toast'
import SelectProjectChips from '../projects/select-project-chips'

type GenerateVersionCardProps = {
  className?: string
  submit: SubmitHook
  registries: Registry[]
  containers: ConvertedContainer[]
  onVersionGenerated: (project: Project, version: VersionDetails) => Promise<void>
}

const GenerateVersionCard = (props: GenerateVersionCardProps) => {
  const { className, submit, registries, containers, onVersionGenerated } = props

  const { t } = useTranslation('compose')
  const routes = useTeamRoutes()

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik<ComposeGenerateVersion>({
    submit,
    validationSchema: generateVersionSchema,
    initialValues: {
      targetType: 'existing-project',
      versionName: '',
      versionType: 'incremental',
      projectName: '',
      project: null,
    },
    onSubmit: async values => {
      let { project } = values

      const addImagesBody: AddImages[] = containers.map(it => {
        const url = imageUrlOfImageTag(it.image)
        const registry = findRegistryByUrl(registries, url)
        const imageName = url.replace(`${registry.imageUrlPrefix}/`, '')

        if (!registry) {
          return null
        }

        return {
          registryId: registry.id,
          images: [imageName],
        }
      })

      const missingRegistry = addImagesBody.find(it => !it)
      if (missingRegistry) {
        toast.error(t('missingRegistry'))
        return
      }

      if (values.targetType === 'new-project') {
        const body: CreateProject = {
          name: values.projectName,
          type: 'versioned',
        }

        const res = await sendForm('POST', routes.project.api.list(), body)
        project = res.ok ? ((await res.json()) as ProjectDetails) : null
        if (!project) {
          await handleApiError(res)
          return
        }
      }

      const body: CreateVersion = {
        name: values.versionName,
        type: values.versionType,
      }

      const res = await sendForm('POST', routes.project.versions(project.id).api.list(), body)
      if (!res.ok) {
        await handleApiError(res)
        return
      }

      const version = (await res.json()) as VersionDetails

      const createImagesRes = await sendForm(
        'POST',
        routes.project.versions(project.id).api.images(version.id),
        addImagesBody,
      )
      if (!createImagesRes.ok) {
        await handleApiError(createImagesRes)
        return
      }

      await onVersionGenerated(project, version)
    },
  })

  const onProjectsFetched = (projects: Project[] | null) => {
    if (projects?.length >= 1) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      formik.setFieldValue('project', projects[0])
    }
  }

  return formik.isSubmitting ? (
    <LoadingIndicator className="self-center" />
  ) : (
    <DyoCard className={className}>
      <DyoForm className="flex flex-col">
        <DyoHeading element="h4" className="text-lg text-bright">
          {t('generateVersion')}
        </DyoHeading>

        <div className="flex flex-row">
          <div className="flex flex-col grow">
            <DyoInput
              className="max-w-lg"
              grow
              name="versionName"
              type="text"
              required
              label={t('versionName')}
              onChange={formik.handleChange}
              value={formik.values.versionName}
              message={formik.errors.versionName}
            />

            <DyoLabel textColor="mt-8 mb-2.5 text-light-eased">{t('versionType')}</DyoLabel>

            <DyoChips
              className="text-bright"
              name="versionType"
              choices={VERSION_TYPE_VALUES}
              selection={formik.values.versionType}
              converter={it => t(`versions:${it}`)}
              onSelectionChange={async (type): Promise<void> => {
                await formik.setFieldValue('versionType', type, false)
              }}
              qaLabel={chipsQALabelFromValue}
            />
          </div>

          <div className="flex flex-col grow">
            <DyoLabel className="mb-2.5 mt-8" textColor="text-light-eased">
              {t('target')}
            </DyoLabel>

            <DyoChips
              className="text-bright"
              name="targetType"
              choices={COMPOSE_TARGET_TYPE_VALUES}
              selection={formik.values.targetType}
              converter={it => t(`targetType.${it}`)}
              onSelectionChange={async (type): Promise<void> => {
                await formik.setFieldValue('targetType', type, false)
              }}
              qaLabel={chipsQALabelFromValue}
            />

            {formik.values.targetType === 'existing-project' ? (
              <>
                <DyoLabel className="mt-8 mb-2.5">{t('common:projects')}</DyoLabel>

                <SelectProjectChips
                  name="projects"
                  types={['versioned']}
                  selection={formik.values.project}
                  onSelectionChange={async it => {
                    await formik.setFieldValue('project', it)
                  }}
                  errorMessage={formik.errors.project as string}
                  onProjectsFetched={onProjectsFetched}
                />
              </>
            ) : (
              <DyoInput
                className="max-w-lg"
                grow
                name="projectName"
                type="text"
                required
                label={t('projectName')}
                onChange={formik.handleChange}
                value={formik.values.projectName}
                message={formik.errors.projectName}
              />
            )}
          </div>
        </div>
      </DyoForm>
    </DyoCard>
  )
}

export default GenerateVersionCard
