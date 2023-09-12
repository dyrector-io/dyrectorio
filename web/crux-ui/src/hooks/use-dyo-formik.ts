import { FormikConfig, FormikValues, useFormik } from 'formik'
import { MutableRefObject, useEffect } from 'react'

type DyoFormikOptions<Values> = FormikConfig<Values> & {
  submitRef?: MutableRefObject<() => Promise<any>>
}

const useDyoFormik = <Values extends FormikValues>(options: DyoFormikOptions<Values>) => {
  const { submitRef, ...formikOptions } = options

  const formik = useFormik({
    validateOnBlur: false,
    validateOnChange: false,
    ...formikOptions,
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
