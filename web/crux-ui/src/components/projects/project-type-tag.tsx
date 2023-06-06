import DyoTag from '@app/elements/dyo-tag'
import { ProjectType } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface ProjectTypeTagProps {
  className?: string
  type: ProjectType
}

const ProjectTypeTag = (props: ProjectTypeTagProps) => {
  const { className, type } = props

  const { t } = useTranslation('projects')

  return type === 'versionless' ? null : (
    <DyoTag className={className} color="bg-dyo-blue" textColor="text-dyo-blue">
      {t(type).toUpperCase()}
    </DyoTag>
  )
}

export default ProjectTypeTag
