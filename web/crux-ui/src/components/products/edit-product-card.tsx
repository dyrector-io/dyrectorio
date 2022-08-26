import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import { DyoTextArea } from '@app/elements/dyo-text-area'
import { DyoToggle } from '@app/elements/dyo-toggle'
import { defaultApiErrorHandler } from '@app/errors'
import { CreateProduct, EditableProduct, Product, UpdateProduct, Version } from '@app/models'
import { API_PRODUCTS, productApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { createProductSchema, updateProductSchema } from '@app/validation'
import { useFormik } from 'formik'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'

interface EditProductCardProps {
  className?: string
  product?: EditableProduct
  onProductEdited: (product: Product) => void
  submitRef?: MutableRefObject<() => Promise<any>>
  versions?: Version[]
}

const EditProductCard = (props: EditProductCardProps) => {
  const { t } = useTranslation('products')

  const [product, setProduct] = useState<EditableProduct>(
    props.product ?? {
      id: null,
      name: '',
      description: '',
      updatedAt: null,
      type: 'complex',
      changelog: null,
    },
  )

  const editing = !!product.id

  const changelogVisible = editing && product.type === 'simple'

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useFormik({
    validationSchema: !editing ? createProductSchema : updateProductSchema,
    initialValues: {
      ...product,
      complex: product.type === 'complex',
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateProduct | UpdateProduct = {
        ...values,
        type: values.complex ? 'complex' : 'simple',
      }

      const res = await (!editing
        ? sendForm('POST', API_PRODUCTS, body as CreateProduct)
        : sendForm('PUT', productApiUrl(product.id), body as UpdateProduct))

      if (res.ok) {
        let result: Product
        if (res.status != 204) {
          const json = await res.json()
          result = json as Product
        } else {
          result = {
            ...values,
            type: values.complex ? 'complex' : 'simple',
          } as Product
        }

        setProduct(result)
        props.onProductEdited(result)
      } else {
        handleApiError(res, setFieldError)
      }

      setSubmitting(false)
    },
  })

  if (props.submitRef) {
    props.submitRef.current = formik.submitForm
  }

  return (
    <DyoCard className={props.className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: product.name }) : t('new')}
      </DyoHeading>

      <DyoLabel className="text-light">{t('tips')}</DyoLabel>

      <form className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
        <DyoInput
          className="max-w-lg"
          grow
          name="name"
          type="name"
          required
          label={t('name')}
          onChange={formik.handleChange}
          value={formik.values.name}
          message={formik.errors.name}
        />

        <DyoTextArea
          className="h-48"
          grow
          name="description"
          label={t('description')}
          onChange={formik.handleChange}
          value={formik.values.description}
        />

        {editing ? null : (
          <div className="mr-auto">
            <DyoToggle
              className="text-bright mt-8"
              name="complex"
              nameChecked={t('complex')}
              nameUnchecked={t('simple')}
              checked={formik.values.complex}
              setFieldValue={formik.setFieldValue}
            />
          </div>
        )}

        {!changelogVisible ? null : (
          <DyoTextArea
            className="h-48"
            grow
            name="changelog"
            label={t('versions:changelog')}
            onChange={formik.handleChange}
            value={formik.values.changelog}
          />
        )}

        <DyoButton className="hidden" type="submit"></DyoButton>
      </form>
    </DyoCard>
  )
}

export default EditProductCard
