import { apiErrorHandler, defaultTranslator } from '@app/errors'
import { DyoApiError, DyoErrorDto, StartDeployment } from '@app/models'
import { TeamRoutes } from '@app/routes'
import { sendForm } from '@app/utils'
import { Translate } from 'next-translate'
import { NextRouter } from 'next/router'
import { DyoConfirmationAction } from './use-confirmation'

export type UseDeployOptions = {
  router: NextRouter
  teamRoutes: TeamRoutes
  t: Translate
  confirm: DyoConfirmationAction
}

export type UseDeployAction = (deploymentId: string, deployInstances?: string[]) => Promise<void>

type ErrorInstance = {
  id: string
  name: string
}

const deployStartErrorHandler = (t: Translate) =>
  apiErrorHandler((stringId: string, status: number, dto: DyoErrorDto) => {
    if (status === 412 && dto.property === 'instanceIds') {
      const instances: ErrorInstance[] = dto.value
      return {
        toast: t('common:errors.deployRequiredSecrets', {
          instances: instances.reduce((message, it) => `${message}\n${it.name}`, ''),
        }),
        toastOptions: {
          className: '!bg-error-red text-center min-w-[32rem]',
        },
      }
    }
    return defaultTranslator(t)(stringId, status, dto)
  })

export const useDeploy = (opts: UseDeployOptions): UseDeployAction => {
  const { router, teamRoutes, t, confirm } = opts

  const handleDeployErrors = deployStartErrorHandler(t)

  const deploy = async (deploymentId: string, deployInstances?: string[], ignoreProtected?: boolean) => {
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
    } else {
      if (res.status === 412) {
        const error = (await res.clone().json()) as DyoApiError
        if (error.property === 'protectedDeploymentId') {
          const confirmed = confirm({
            title: t('common:deployProtection.title'),
            description: t('common:deployProtection.description'),
          })

          if (!confirmed) {
            return
          }

          await deploy(deploymentId, deployInstances, true)

          return
        }
      }

      handleDeployErrors(res)
    }
  }

  return async (deploymentId, deployInstances) => deploy(deploymentId, deployInstances)
}
