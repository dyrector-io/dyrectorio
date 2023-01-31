import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoChips from '@app/elements/dyo-chips'
import DyoForm from '@app/elements/dyo-form'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoInput } from '@app/elements/dyo-input'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { defaultApiErrorHandler } from '@app/errors'
import useDyoFormik from '@app/hooks/use-dyo-formik'
import { CreateProduct, EditableProduct, Product, PRODUCT_TYPE_VALUES, UpdateProduct } from '@app/models'
import { API_PRODUCTS, productApiUrl } from '@app/routes'
import { sendForm } from '@app/utils'
import { createProductSchema, updateProductSchema } from '@app/validations'
import useTranslation from 'next-translate/useTranslation'
import { MutableRefObject, useState } from 'react'

interface EditProductCardProps {
  className?: string
  product?: EditableProduct
  onProductEdited: (product: Product) => void
  submitRef?: MutableRefObject<() => Promise<any>>
}

const EditProductCard = (props: EditProductCardProps) => {
  const { product: propsProduct, className, onProductEdited, submitRef } = props

  const { t } = useTranslation('products')

  const [product, setProduct] = useState<EditableProduct>(
    propsProduct ?? {
      id: null,
      name: '',
      description: '',
      updatedAt: null,
      type: 'complex',
      changelog: '',
    },
  )

  const editing = !!product.id

  const changelogVisible = editing && product.type === 'simple'

  const handleApiError = defaultApiErrorHandler(t)

  const formik = useDyoFormik({
    initialValues: {
      ...product,
    },
    validationSchema: !editing ? createProductSchema : updateProductSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true)

      const body: CreateProduct | UpdateProduct = {
        ...values,
      }

      const res = await (!editing
        ? sendForm('POST', API_PRODUCTS, body as CreateProduct)
        : sendForm('PUT', productApiUrl(product.id), body as UpdateProduct))

      if (res.ok) {
        let result: Product
        if (res.status !== 204) {
          const json = await res.json()
          result = json as Product
        } else {
          result = {
            ...values,
          } as Product
        }

        setProduct(result)
        setSubmitting(false)
        onProductEdited(result)
      } else {
        setSubmitting(false)
        handleApiError(res, setFieldError)
      }
    },
  })

  if (submitRef) {
    submitRef.current = formik.submitForm
  }

  return (
    <DyoCard className={className}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {editing ? t('common:editName', { name: product.name }) : t('new')}
      </DyoHeading>

      <DyoLabel textColor="text-bright-muted">{t('tips')}</DyoLabel>

      <DyoForm className="flex flex-col" onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
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
          <>
            <DyoLabel textColor="mt-8 mb-2.5 text-light-eased">{t('type')}</DyoLabel>
            <DyoChips
              className="text-bright"
              choices={PRODUCT_TYPE_VALUES}
              initialSelection={formik.values.type}
              converter={it => t(it)}
              onSelectionChange={type => {
                formik.setFieldValue('type', type, false)
              }}
            />
          </>
        )}

        {!changelogVisible ? null : (
          <DyoTextArea
            className="h-48"
            grow
            name="changelog"
            label={t('changelog')}
            onChange={formik.handleChange}
            value={formik.values.changelog}
          />
        )}

        <DyoButton className="hidden" type="submit" />
      </DyoForm>
    </DyoCard>
  )
}

export default EditProductCard
