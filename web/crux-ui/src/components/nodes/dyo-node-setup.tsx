import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoIcon from '@app/elements/dyo-icon'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoToggle from '@app/elements/dyo-toggle'
import TimeLabel from '@app/elements/time-label'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import useTeamRoutes from '@app/hooks/use-team-routes'
import useTimer from '@app/hooks/use-timer'
import {
  NODE_INSTALL_SCRIPT_TYPE_VALUES,
  NODE_TYPE_VALUES,
  NodeDetails,
  NodeGenerateScript,
  NodeInstall,
  NodeInstallScriptType,
  NodeType,
} from '@app/models'
import { sendForm, writeToClipboard } from '@app/utils'
import { nodeGenerateScriptSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import ShEditor from '../shared/sh-editor'

const expiresIn = (expireAt: Date): number => {
  const now = new Date().getTime()
  return (expireAt.getTime() - now) / 1000
}

interface DyoNodeSetupProps {
  node: NodeDetails
  onNodeInstallChanged: (install: NodeInstall) => void
  onNodeTypeChanged: (type: NodeType) => void
}

const DyoNodeSetup = (props: DyoNodeSetupProps) => {
  const { node, onNodeTypeChanged, onNodeInstallChanged } = props

  const { t } = useTranslation('nodes')
  const routes = useTeamRoutes()

  const [remaining, startCountdown, cancelCountdown] = useTimer(
    node.install ? expiresIn(new Date(node.install.expireAt)) : null,
    () => onNodeInstallChanged(null),
  )

  const handleApiError = defaultApiErrorHandler(t)

  const onDiscard = async () => {
    const res = await fetch(routes.node.api.script(node.id), {
      method: 'DELETE',
    })

    if (!res.ok) {
      await handleApiError(res)
      return
    }

    cancelCountdown()
    onNodeInstallChanged(null)
  }

  const onCopyScript = () => writeToClipboard(t, node.install.command)

  const formik = useDyoFormik<NodeGenerateScript>({
    initialValues: {
      type: node.type,
      rootPath: '',
      scriptType: 'shell',
      dagentTraefik: null,
    },
    validationSchema: nodeGenerateScriptSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true)

      if (remaining > 0) {
        cancelCountdown()
      }

      const res = await sendForm('POST', routes.node.api.script(node.id), values)

      if (!res.ok) {
        setSubmitting(false)
        await handleApiError(res)
        return
      }

      const install = (await res.json()) as NodeInstall

      startCountdown(expiresIn(new Date(install.expireAt)))

      onNodeInstallChanged(install)

      setSubmitting(false)
    },
  })

  const onTraefikChanged = it => formik.setFieldValue('dagentTraefik', it ? {} : null)

  const onTypeChanged = it => {
    if (it === 'k8s') {
      // If kubernetes is selected make sure to set the script type back to shell
      formik.setFieldValue('scriptType', 'shell', false)
    }
    onNodeTypeChanged(it)
  }

  return (
    <DyoCard>
      <DyoHeading element="h4" className="text-lg text-bright mb-4">
        {t('installTheAgent')}
      </DyoHeading>

      <div className="text-bright mb-4">
        <DyoHeading element="h4" className="text-md">
          {t('whatScriptDoesHeader')}
        </DyoHeading>

        <p className="text-light-eased ml-4">{t('scriptExplanation')}</p>
      </div>

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        {!node.install ? (
          <div className="mb-4">
            <DyoHeading element="h4" className="text-lg text-bright mb-2">
              {t('technology')}
            </DyoHeading>

            <DyoChips
              className="mb-2 ml-2"
              choices={NODE_TYPE_VALUES}
              selection={formik.values.type}
              converter={(it: NodeType) => t(`technologies.${it}`)}
              onSelectionChange={it => {
                formik.setFieldValue('type', it, true)
                onTypeChanged(it)
              }}
            />

            {node.type === 'docker' && (
              <div className="flex flex-col">
                <DyoHeading element="h4" className="text-lg text-bright">
                  {t('traefik')}
                </DyoHeading>

                <DyoToggle
                  className="mx-4 my-2"
                  labelClassName="text-light-eased mr-4"
                  name="traefik"
                  checked={!!formik.values.dagentTraefik}
                  onCheckedChange={onTraefikChanged}
                  label={t('installTraefik')}
                />

                {formik.values.dagentTraefik && (
                  <div className="ml-2 mb-2">
                    <DyoLabel className="text-lg mb-2.5" textColor="text-bright">
                      {t('traefikAcmeEmail')}
                    </DyoLabel>

                    <DyoInput
                      name="dagentTraefik.acmeEmail"
                      className="max-w-lg mb-2.5"
                      grow
                      value={formik.values.dagentTraefik.acmeEmail ?? ''}
                      onChange={formik.handleChange}
                      message={formik.errors.dagentTraefik ? formik.errors.dagentTraefik.acmeEmail : null}
                    />
                  </div>
                )}

                <div className="text-bright mb-4">
                  <DyoHeading element="h4" className="text-md">
                    {t('whatIsTraefik')}
                  </DyoHeading>

                  <p className="text-light-eased ml-4">{t('traefikExplanation')}</p>
                </div>

                <DyoHeading element="h4" className="text-lg text-bright mb-2">
                  {t('type')}
                </DyoHeading>

                <DyoChips
                  className="mb-2 ml-2"
                  choices={NODE_INSTALL_SCRIPT_TYPE_VALUES}
                  selection={formik.values.scriptType}
                  converter={(it: NodeInstallScriptType) => t(`installScript.${it}`)}
                  onSelectionChange={it => formik.setFieldValue('scriptType', it, true)}
                />

                <DyoLabel className="text-lg mb-2.5" textColor="text-bright">
                  {t('persistentDataPath')}
                </DyoLabel>

                <DyoInput
                  name="rootPath"
                  placeholder={t('optionalLeaveEmptyForDefaults')}
                  className="max-w-lg ml-2 mb-2.5"
                  grow
                  value={formik.values.rootPath}
                  onChange={formik.handleChange}
                  message={formik.errors.rootPath}
                />
                <p className="text-sm text-light-eased ml-4 mb-2.5">{t('persistentDataExplanation')}</p>
              </div>
            )}

            <DyoButton className="px-4 py-2 mt-4 mr-auto" type="submit">
              {t('generateScript')}
            </DyoButton>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <DyoLabel className="mt-8 mb-2.5 whitespace-nowrap">{t('command')}</DyoLabel>

              <div className="flex flex-row items-center">
                <DyoInput
                  className="bg-gray-900"
                  containerClassName="flex-1"
                  readOnly
                  grow
                  defaultValue={node.install.command}
                  onFocus={ev => ev.target.select()}
                />

                <div onClick={onCopyScript} className="cursor-pointer ml-2 h-11 w-11 flex items-center justify-center">
                  <DyoIcon size="md" src="/copy-alt.svg" alt={t('common:copy')} />
                </div>
              </div>

              <div className="flex flex-row mt-2">
                <DyoLabel className="text-white mr-2">{t('scriptExpiresIn')}</DyoLabel>

                <TimeLabel textColor="text-dyo-turquoise" seconds={remaining} />
              </div>
            </div>

            <div className="flex flex-row mt-4 mb-4">
              <DyoButton className="px-4 py-2 mr-4" secondary onClick={onDiscard}>
                {t('common:discard')}
              </DyoButton>
            </div>

            <div className="flex flex-col">
              <DyoLabel className="mb-2.5">{t('script')}</DyoLabel>

              <ShEditor className="h-48 mb-4 w-full overflow-x-auto" readOnly value={node.install.script} />
            </div>
          </>
        )}
      </DyoForm>
    </DyoCard>
  )
}

export default DyoNodeSetup
