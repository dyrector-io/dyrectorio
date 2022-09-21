import { getValidationError, nameRule, versionRegex } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'

const useVersionHint = (value: string) => {
  const { t } = useTranslation('versions')

  const checkVersionHint = version => {
    const err = getValidationError(nameRule, version)
    if (!versionRegex.test(version) && !err) {
      return t('versionSemanticHint')
    }
    return null
  }

  const [versionHint, setVersionHint] = useState<string>(value ? checkVersionHint(value) : null)

  const hintUpdate = (changedVersion: string) => {
    setVersionHint(checkVersionHint(changedVersion))
  }

  return [versionHint, hintUpdate] as const
}

export default useVersionHint
