import { yupErrorTranslate } from '@app/validations'
import { FormikConfig, FormikHelpers, FormikValues, useFormik } from 'formik'
import { Translate } from 'next-translate'
import { useCallback, useEffect } from 'react'
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
    onSubmit: options.onSubmit,
  })

  const submitSet = submit?.set
  const formikSubmitForm = formik.submitForm

  const submitForm = useCallback(() => formikSubmitForm(), [formikSubmitForm])

  useEffect(() => {
    if (submitSet) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      submitSet(submitForm, formik.isSubmitting)
    }
  }, [submitSet, submitForm, formik.isSubmitting])

  return formik
}

export default useDyoFormik
