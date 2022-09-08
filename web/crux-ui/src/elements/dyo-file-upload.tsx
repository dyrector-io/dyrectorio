import DyoButton from '@app/elements/dyo-button'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { DyoLabel } from './dyo-label'

export interface DyoFileUploadProps {
  name: string
  multiple: boolean
  handleFile: Function
  accept: string
  label?: string
}

export const DyoFileUploadInput = (props: DyoFileUploadProps) => {
  const { t } = useTranslation('common')
  const { name, multiple, handleFile, accept, label } = props

  const hiddenFileInput = React.useRef(null)

  const handleClick = () => {
    hiddenFileInput.current.click()
  }

  const handleChange = event => {
    const filesUploaded = multiple ? event.target.files : event.target.files[0]
    if (filesUploaded) {
      handleFile(filesUploaded)
    }
  }

  return (
    <>
      {!label ? null : (
        <DyoLabel className="mt-8 mb-2.5" htmlFor={name}>
          {label}
        </DyoLabel>
      )}

      <DyoButton className="px-6 w-28" outlined type="button" onClick={handleClick}>
        {t('upload')}
      </DyoButton>

      <input
        type="file"
        accept={accept}
        multiple={multiple}
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  )
}
