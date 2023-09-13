import { FormikConfig, FormikHelpers, FormikValues, useFormik } from 'formik'
import { useEffect } from 'react'
import { SubmitHook } from './use-submit'

type DyoFormikOptions<Values> = FormikConfig<Values> & {
  submit?: SubmitHook
}

const useDyoFormik = <Values extends FormikValues>(options: DyoFormikOptions<Values>) => {
  const { submit, ...formikOptions } = options

  const formik = useFormik({
    validateOnBlur: false,
    validateOnChange: false,
    ...formikOptions,
    validationSchema: () => ({
      ...options.validationSchema,
      validateSync: (values: any, validationOptions: any) => {
        console.info('FORMIK - VALIDATE SYNC')
        if (options.validationSchema) {
          return options.validationSchema.validateSync(values, validationOptions)
        }
        return true
      },
      validate: (values: any, validationOptions: any) => {
        console.info('FORMIK - VALIDATE')
        if (options.validationSchema) {
          return options.validationSchema.validate(values, validationOptions)
        }
        return Promise.resolve(true)
      },
    }),
    onSubmit: async (values: Values, helpers: FormikHelpers<Values>) => {
      console.info('FORMIK - SUBMIT')
      if (options.onSubmit) {
        const result = options.onSubmit(values, helpers)
        if (typeof result === 'object') {
          await result
        }
      } else {
        console.error('FORMIK - NO SUBMIT')
      }
    },
  })

  if (submit) {
    submit.set(formik.submitForm)
  }

  return formik
}

export default useDyoFormik
