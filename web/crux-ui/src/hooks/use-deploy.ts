import { defaultApiErrorHandler } from '@app/errors'
import { DeploymentDetails, DyoApiError, mergeConfigsWithConcreteConfig, StartDeployment } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { sendForm } from '@app/utils'
import {
  getValidationError,
  startDeploymentSchema,
  validationErrorToInstance,
  yupErrorTranslate,
} from '@app/validations'
import { Translate } from 'next-translate'
import useTranslation from 'next-translate/useTranslation'
import { NextRouter } from 'next/router'
import { QA_DIALOG_LABEL_DEPLOY_PROTECTED } from 'quality-assurance'
import toast from 'react-hot-toast'
import { DyoConfirmationAction } from './use-confirmation'

export type UseDeployOptions = {
  router: NextRouter
  teamRoutes: TeamRoutes
  t: Translate
  confirm: DyoConfirmationAction
}

export type DeployOptions = {
  deploymentId?: string
  deployment?: DeploymentDetails
  deployInstances?: string[]
  ignoreProtected?: boolean
}

export type UseDeployAction = (options: DeployOptions) => Promise<void>

type ErrorInstance = {
  id: string
  name: string
}

const toastClassName = '!bg-error-red text-center min-w-[42rem]'

export const useDeploy = (opts: UseDeployOptions): UseDeployAction => {
  const { router, teamRoutes, t, confirm } = opts
  const handleApiError = defaultApiErrorHandler(t)

  const { t: tContainer } = useTranslation('container')

  const deploy = async (options: DeployOptions) => {
    const { deploymentId: optionsDeploymentId, deployment, deployInstances, ignoreProtected } = options
    const deploymentId = optionsDeploymentId ?? deployment?.id

    if (deployment) {
      const selectedInstances = deployInstances
        ? deployment.instances.filter(it => deployInstances.includes(it.id))
        : deployment.instances

      const target: DeploymentDetails = {
        ...deployment,
        instances: selectedInstances.map(it => ({
          ...it,
          config: {
            ...it.config,
            ...mergeConfigsWithConcreteConfig([it.image.config], it.config),
          },
        })),
      }

      const error = getValidationError(startDeploymentSchema, target)
      if (error) {
        console.error(error.message, error)

        const translatedError = yupErrorTranslate(error, tContainer)
        const intanceIndex = validationErrorToInstance(error.path)

        toast.error(
          tContainer('errors:validationFailedForInstanceMessage', {
            ...translatedError,
            path:
              intanceIndex !== null
                ? selectedInstances[intanceIndex].config.name ?? selectedInstances[intanceIndex].image.config.name
                : translatedError.path,
          }),
          {
            className: toastClassName,
          },
        )
        return
      }
    }

    const res = await sendForm(
      'POST',
      teamRoutes.deployment.api.start(deploymentId, ignoreProtected),
      deployInstances
        ? ({
            instances: deployInstances,
          } as StartDeployment)
        : null,
    )

    if (res.ok) {
      await router.push(teamRoutes.deployment.deploy(deploymentId))
      return
    }

    const dto = (await res.clone().json()) as DyoApiError
    const { property, value, error } = dto

    if (res.status === 412) {
      if (property === 'instanceIds') {
        const instances: ErrorInstance[] = value
        toast.error(
          t('errors:deployRequiredSecrets', {
            instances: instances.reduce((message, it) => `${message}\n${it.name}`, ''),
          }),
          {
            className: toastClassName,
          },
        )

        return
      }

      if (property === 'protectedDeploymentId') {
        const confirmed = await confirm({
          qaLabel: QA_DIALOG_LABEL_DEPLOY_PROTECTED,
          title: t('common:deployProtection.title'),
          description: t('common:deployProtection.description'),
        })

        if (!confirmed) {
          return
        }

        await deploy({
          ...options,
          ignoreProtected: true,
        })

        return
      }
    }

    if (res.status === 400) {
      if (error === 'keysAreUnique') {
        toast.error(
          t('errors:validationFailed', {
            message: dto.description,
            path: dto.property,
          }),
          {
            className: toastClassName,
          },
        )
        return
      }

      if (deployment) {
        const intanceIndex = validationErrorToInstance(property)
        if (intanceIndex) {
          toast.error(
            t('errors:validationFailedForInstance', {
              path:
                intanceIndex !== null
                  ? deployment.instances[intanceIndex].config.name ??
                    deployment.instances[intanceIndex].image.config.name
                  : property,
            }),
            {
              className: toastClassName,
            },
          )
          return
        }
      }

      toast.error(t('errors:validationFailedForDeployment'), {
        className: toastClassName,
      })
      return
    }

    await handleApiError(res)
  }

  return deploy
}
