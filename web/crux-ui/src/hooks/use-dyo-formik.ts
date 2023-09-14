import { yupErrorTranslate } from '@app/validations'
import { FormikConfig, FormikHelpers, FormikValues, useFormik } from 'formik'
import { Translate } from 'next-translate'
import { SubmitHook } from './use-submit'

export type DyoFormikOptions<Values> = FormikConfig<Values> & {
  submit?: SubmitHook
  t?: Translate
}

const useDyoFormik = <Values extends FormikValues>(options: DyoFormikOptions<Values>) => {
  const { submit, t, ...formikOptions } = options

  const formik = useFormik({
    validateOnBlur: false,
    validateOnChange: false,
    ...formikOptions,
    validationSchema: options.validationSchema
      ? () => ({
          ...options.validationSchema,
          validateSync: (values: any, validationOptions: any) => {
            try {
              return options.validationSchema.validateSync(values, validationOptions)
            } catch (err) {
              throw t ? yupErrorTranslate(err, t) : err
            }
          },
          validate: async (values: any, validationOptions: any) => {
            try {
              await options.validationSchema.validate(values, validationOptions)
            } catch (err) {
              throw t ? yupErrorTranslate(err, t) : err
            }
          },
        })
      : null,
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
