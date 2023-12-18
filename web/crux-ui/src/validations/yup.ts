import { RegistryType } from '@app/models'
import * as yup from 'yup'

const checkType = (type: RegistryType, types: RegistryType | RegistryType[]) =>
  Array.isArray(types) ? types.includes(type) : type === types

yup.addMethod(
  yup.string,
  'requiredWhenTypeIs',
  function (this: yup.StringSchema, options: yup.RequiredWhenTypeOptions | RegistryType[]) {
    if (Array.isArray(options)) {
      return this.when(['type'], {
        is: (it: RegistryType) => options.includes(it),
        then: it => it.required(),
      })
    }

    const { public: publicTypes, private: privateTypes } = options

    return this.when(['type', 'private'], {
      is: (it: RegistryType, _private: boolean) =>
        checkType(it, publicTypes) || (_private && checkType(it, privateTypes)),
      then: it => it.required(),
    })
  },
)

yup.addMethod(
  yup.string,
  'labelNamespace',
  function (this: yup.StringSchema, when: string, thenLabel: string, otherwiseLabel: string) {
    return this.when('namespace', {
      is: namespace => namespace === when,
      then: it => it.label(thenLabel),
      otherwise: it => it.label(otherwiseLabel),
    })
  },
)

yup.addMethod(
  yup.string,
  'labelType',
  function (this: yup.StringSchema, labels: Record<string, string | ((s: yup.StringSchema) => yup.StringSchema)>) {
    return this.when('type', (values: string[], schema: yup.StringSchema) => {
      const [type] = values
      const handlerOrLabel = labels[type]
      if (!handlerOrLabel) {
        return schema
      }
      return typeof handlerOrLabel === 'string' ? schema.label(handlerOrLabel) : handlerOrLabel(schema)
    })
  },
)

function whenType<TSchema extends yup.Schema>(
  this: TSchema,
  type: RegistryType | RegistryType[],
  then: (s: TSchema) => TSchema,
) {
  return this.when('type', {
    is: it => checkType(it, type),
    then,
  })
}
yup.addMethod(yup.string, 'whenType', whenType<yup.StringSchema>)
yup.addMethod(yup.mixed, 'whenType', whenType<yup.MixedSchema>)

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
