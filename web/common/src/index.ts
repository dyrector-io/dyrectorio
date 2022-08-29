import * as yup from 'yup'

export const portNumberRule = yup.number().positive().lessThan(65536).required()