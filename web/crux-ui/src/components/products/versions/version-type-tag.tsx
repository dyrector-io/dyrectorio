import DyoTag from '@app/elements/dyo-tag'
import { VersionType } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface VersionTypeTagProps {
  className?: string
  type: VersionType
}

const VersionTypeTag = (props: VersionTypeTagProps) => {
  const { t } = useTranslation('versions')

  return (
    <DyoTag className={props.className} color="bg-dyo-blue" textColor="text-dyo-blue">
      {t(props.type).toUpperCase()}
    </DyoTag>
  )
}

export default VersionTypeTag
