import DyoTag from '@app/elements/dyo-tag'
import { RegistryType } from '@app/models'
import useTranslation from 'next-translate/useTranslation'

interface RegistryTypeTagProps {
  className?: string
  type: RegistryType
}

const RegistryTypeTag = (props: RegistryTypeTagProps) => {
  const { t } = useTranslation('registries')

  return (
    <DyoTag className={props.className} color="bg-dyo-blue" textColor="text-dyo-blue">
      {t(`type.${props.type}`).toUpperCase()}
    </DyoTag>
  )
}

export default RegistryTypeTag
