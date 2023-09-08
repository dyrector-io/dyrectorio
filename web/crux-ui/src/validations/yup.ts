import * as yup from 'yup'

// NOTE(@robot9706): Replace each yup locale object with `errors:yup.[type].[message]`.
// Types and messages are defined here: https://github.com/jquense/yup/blob/master/src/locale.ts
// Each message should have an entry in errors.json
const getYupLocale = () => {
  const newLocale: yup.LocaleObject = {}
  Object.keys(yup.defaultLocale).forEach(typeKey => {
    const typeLocale = yup.defaultLocale[typeKey]
    const newTypeLocale = {}

    Object.keys(typeLocale).forEach(messageKey => {
      newTypeLocale[messageKey] = `errors:yup.${typeKey}.${messageKey}`
    })

    newLocale[typeKey] = newTypeLocale
  })

  return newLocale
}

// NOTE(@robot9706): Yup setLocale must be called before creating any schemas, otherwise the custom locale won't be used.
// To achieve this use "import yup from './yup'" in validation schema files.
// https://github.com/jquense/yup/issues/293#issuecomment-414450125
// https://github.com/jquense/yup/pull/1371
yup.setLocale(getYupLocale())

export default yup
