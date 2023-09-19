import { yupErrorTranslate } from '@app/validations'
import { FormikConfig, FormikValues, useFormik } from 'formik'
import { Translate } from 'next-translate'
import { MutableRefObject, useEffect } from 'react'

export type DyoFormikOptions<Values> = FormikConfig<Values> & {
  submitRef?: MutableRefObject<() => Promise<any>>
  t?: Translate
}

const useDyoFormik = <Values extends FormikValues>(options: DyoFormikOptions<Values>) => {
  const { submitRef, t, ...formikOptions } = options

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
  })

  useEffect(() => {
    if (!submitRef) {
      return
    }

    submitRef.current = formik.submitForm
  }, [submitRef, formik.submitForm])

  return formik
}

export default useDyoFormik
