import { yupErrorTranslate } from '@app/validations'
import { FormikConfig, FormikValues, useFormik } from 'formik'
import { Translate } from 'next-translate'

export type DyoFormikOptions<Values> = FormikConfig<Values> & {
  t?: Translate
}

const useDyoFormik = <Values extends FormikValues>({ t, ...options }: DyoFormikOptions<Values>) =>
  useFormik({
    validateOnBlur: false,
    validateOnChange: false,
    ...options,
    validationSchema: options.validationSchema
      ? () => {
          return {
            ...options.validationSchema,
            validateSync: (values: any, validationOptions: any) => {
              return options.validationSchema.validateSync(values, validationOptions)
            },
            validate: (values: any, validationOptions: any) =>
              new Promise<void>((resolve, reject) => {
                options.validationSchema
                  .validate(values, validationOptions)
                  .then(() => resolve())
                  .catch(err => reject(t ? yupErrorTranslate(err, t) : err))
              }),
          }
        }
      : null,
  })

export default useDyoFormik
