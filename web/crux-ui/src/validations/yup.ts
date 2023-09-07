import * as yup from 'yup'

type Message = string | ((params: any) => string)

const createMessage = (original: Message) => (params: any) => {
  const newParams = {
    ...params,
    path: params.label ? `\${${params.label}}` : params.path,
    regex: params.spec?.meta?.regex ? `\${${params.spec?.meta?.regex}}` : params.regex,
  }

  if (typeof original === 'string') {
    // NOTE(@robot9706): The regex below matches string interpolation parameters with extra dots and colons.
    // For example ${common:errors.validation}.
    return original.replace(/\$\{\s*((\w|:|\.)+)\s*\}/g, (_, key) => yup.printValue(newParams[key]))
  }

  return original(newParams)
}

const getYupLocale = () => {
  // TODO(@robot9706): Unable to access translation here, but we need to set the
  // locale before creating schemas or it won't work
  const overrides: yup.LocaleObject = {
    mixed: {
      // eslint-disable-next-line no-template-curly-in-string
      required: '${path} is required',
      notType: ({ path, type }) => `${path} is not ${type}`,
    },
    string: {
      matches: ({ path, regex }) => `${path} must ${regex}`,
    },
  }

  const newLocale: yup.LocaleObject = {}
  Object.keys(yup.defaultLocale).forEach(typeKey => {
    const typeLocale = yup.defaultLocale[typeKey]
    const overrideLocale = overrides[typeKey]

    const newTypeLocale = {}

    Object.keys(typeLocale).forEach(messageKey => {
      const yupMessage = typeLocale[messageKey] as Message
      const overrideMessage = overrideLocale?.[messageKey] as Message

      newTypeLocale[messageKey] = createMessage(overrideMessage ?? yupMessage)
    })

    newLocale[typeKey] = newTypeLocale
  })

  return newLocale
}

// NOTE(@robot9706): Yup setLocale must be called before creating any schemas,
// otherwise the custom locale won't be used
// https://github.com/jquense/yup/issues/293 (https://github.com/jquense/yup/issues/293#issuecomment-414450125)
// https://github.com/jquense/yup/pull/1371
yup.setLocale(getYupLocale())

export default yup
