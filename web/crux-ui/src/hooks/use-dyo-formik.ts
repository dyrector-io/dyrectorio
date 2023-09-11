import { FormikConfig, FormikValues, useFormik } from 'formik'
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
  })

  useEffect(() => {
    if (!submit) {
      return
    }

    submit.set(formik.submitForm)
  }, [submit, formik.submitForm])

  return formik
}

export default useDyoFormik
