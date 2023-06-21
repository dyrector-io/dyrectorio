import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import { ProjectDetails } from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import ProjectTypeTag from './project-type-tag'

interface ProjectDetailsCardProps {
  className?: string
  project: ProjectDetails
  onConvertToVersioned: () => void
}

const ProjectDetailsCard = (props: ProjectDetailsCardProps) => {
  const { project, className, onConvertToVersioned } = props

  const { t } = useTranslation('projects')

  const [convertModelConfig, confirmConvert] = useConfirmation()

  const version = project.type === 'versionless' ? project.versions[0] : null

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col')}>
      <div className="flex flex-row">
        <div>
          <Image
            className="aspect-square"
            src="/project_default.svg"
            alt={t('altPicture', { name: project.name })}
            width={100}
            height={100}
          />
        </div>

        <div className="flex flex-col ml-6 w-full overflow-auto">
          <div className="flex flex-row">
            <DyoHeading element="h5" className="text-xl text-bright leading-none">
              {project.name}
            </DyoHeading>

            <div className="flex flex-col ml-auto">
              <span className="text-bright whitespace-nowrap" suppressHydrationWarning>
                {auditToLocaleDate(project.audit)}
              </span>

              <ProjectTypeTag className="mt-2 ml-auto" type={project.type} />
            </div>
          </div>

          <div className="overflow-hidden mt-2">
            <DyoExpandableText
              text={project.description}
              lineClamp={2}
              className="text-md text-light"
              modalTitle={project.name}
            />
          </div>
        </div>
      </div>

      {!version ? null : (
        <>
          <div className="flex flex-row mt-2 items-center">
            <span className="text-bright font-bold flex-1">{t('common:changelog')}</span>
            <DyoButton className="px-2" outlined onClick={() => confirmConvert(onConvertToVersioned)}>
              {t('convertToVersioned')}
            </DyoButton>
          </div>

          <DyoExpandableText
            text={version.changelog}
            lineClamp={6}
            className="text-md text-bright mt-2 max-h-44"
            buttonClassName="ml-auto my-2"
            modalTitle={t('common:changelogName', { name: version.name })}
          />
        </>
      )}

      {!onConvertToVersioned ? null : (
        <DyoConfirmationModal
          config={convertModelConfig}
          title={t('convertProjectToVersioned', { name: project.name })}
          description={t('areYouSureWantToConvert')}
          className="w-1/4"
          confirmColor="bg-error-red"
        />
      )}
    </DyoCard>
  )
}

export default ProjectDetailsCard
