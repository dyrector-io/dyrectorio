import { FormikConfig, FormikValues, useFormik } from 'formik'
import { MutableRefObject, useEffect } from 'react'

const useDyoFormik = <Values extends FormikValues>(
  options: FormikConfig<Values>,
  submitRef?: MutableRefObject<() => Promise<any>>,
) => {
  const formik = useFormik({
    validateOnBlur: false,
    validateOnChange: false,
    ...options,
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
