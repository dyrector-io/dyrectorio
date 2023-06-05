import { DyoCard } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import { ProjectDetails } from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import ProjectTypeTag from './project-type-tag'

interface ProjectDetailsCardProps {
  className?: string
  project: ProjectDetails
}

const ProjectDetailsCard = (props: ProjectDetailsCardProps) => {
  const { project, className } = props

  const { t } = useTranslation('projects')

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

              <ProjectTypeTag className="ml-auto mt-2" type={project.type} />
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
          <span className="text-bright font-bold mt-2">{t('common:changelog')}</span>

          <DyoExpandableText
            text={version.changelog}
            lineClamp={6}
            className="text-md text-bright mt-2 max-h-44"
            buttonClassName="ml-auto my-2"
            modalTitle={t('common:changelogName', { name: version.name })}
          />
        </>
      )}
    </DyoCard>
  )
}

export default ProjectDetailsCard
