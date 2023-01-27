import { FormikConfig, FormikValues, useFormik } from 'formik'

const useDyoFormik = <Values extends FormikValues>(options: FormikConfig<Values>) =>
  useFormik({
    validateOnBlur: false,
    validateOnChange: false,
    ...options,
  })

export default useDyoFormik
