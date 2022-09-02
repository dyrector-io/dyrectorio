import DyoTag from '@app/elements/dyo-tag'
import { VersionType } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface VersionTypeTagProps {
  className?: string
  type: VersionType
}

const VersionTypeTag = (props: VersionTypeTagProps) => {
  const { className, type } = props

  const { t } = useTranslation('versions')

  return (
    <DyoTag className={className} color="bg-dyo-blue" textColor="text-dyo-blue">
      {t(type).toUpperCase()}
    </DyoTag>
  )
}

export default VersionTypeTag
