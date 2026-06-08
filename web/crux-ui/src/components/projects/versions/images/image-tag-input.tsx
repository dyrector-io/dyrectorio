import { DyoInput } from '@app/elements/dyo-input'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

type ImageTagInputProps = {
  disabled?: boolean
  value: string
  onTagSelected: (tag: string) => void
}

const ImageTagInput = (props: ImageTagInputProps) => {
  const { disabled, value: propsValue, onTagSelected } = props

  const { t } = useTranslation('images')

  const [selected, setSelected] = useState(propsValue ?? '')

  return (
    <div className="flex flex-col mt-6 mb-8">
      <DyoInput
        label={t('tag')}
        labelClassName="mb-2.5"
        placeholder={t('tag')}
        disabled={disabled}
        value={selected}
        onChange={e => {
          const { value } = e.target
          setSelected(value)
          if (value?.length > 0) {
            onTagSelected(value)
          }
        }}
        messageType="info"
        message={!selected.length && t('tagRequired')}
      />

      <p className="text-light-eased ml-4 mt-2">{t('uncheckedRegistryExplanation')}</p>
    </div>
  )
}

export default ImageTagInput
