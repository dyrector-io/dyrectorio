import useEditorState from '@app/components/editor/use-editor-state'
import useItemEditorState from '@app/components/editor/use-item-editor-state'
import { Layout } from '@app/components/layout'
import CommonConfigSection from '@app/components/products/versions/images/config/common-config-section'
import CraneConfigSection from '@app/components/products/versions/images/config/crane-config-section'
import DagentConfigSection from '@app/components/products/versions/images/config/dagent-config-section'
import EditImageJson from '@app/components/products/versions/images/edit-image-json'
import ImageConfigFilters from '@app/components/products/versions/images/image-config-filters'
import { BreadcrumbLink } from '@app/components/shared/breadcrumb'
import PageHeading from '@app/components/shared/page-heading'
import { IMAGE_WS_REQUEST_DELAY } from '@app/const'
import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoMessage from '@app/elements/dyo-message'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import { useThrottling } from '@app/hooks/use-throttleing'
import useWebSocket from '@app/hooks/use-websocket'
import {
  ContainerConfig,
  DeleteImageMessage,
  ImageConfigFilterType,
  imageConfigToJsonContainerConfig,
  PatchImageMessage,
  ProductDetails,
  VersionDetails,
  VersionImage,
  WS_TYPE_DELETE_IMAGE,
  WS_TYPE_PATCH_IMAGE,
} from '@app/models'
import { imageConfigUrl, productUrl, ROUTE_PRODUCTS, versionUrl, versionWsUrl } from '@app/routes'
import { withContextAuthorization } from '@app/utils'
import { containerConfigSchema, getValidationError } from '@app/validations'
import { cruxFromContext } from '@server/crux/crux'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { ValidationError } from 'yup'

const getContainerConfigFieldErrors = (newConfig: ContainerConfig): ValidationError[] =>
  getValidationError(containerConfigSchema, newConfig, { abortEarly: false })?.inner ?? []

const jsonErrorOf = (fieldErrors: ValidationError[]) => (fieldErrors.length > 0 ? fieldErrors[0].message : null)

type ViewState = 'editor' | 'json'

interface ImageDetailsPageProps {
  product: ProductDetails
  version: VersionDetails
  image: VersionImage
}

const ImageDetailsPage = (props: ImageDetailsPageProps) => {
  const { t } = useTranslation('images')
  const { image, product, version } = props

  const [filters, setFilters] = useState<ImageConfigFilterType[]>([])
  const [config, setConfig] = useState<ContainerConfig>(image.config)
  const [viewState, setViewState] = useState<ViewState>('editor')
  const [fieldErrors, setFieldErrors] = useState<ValidationError[]>(() => getContainerConfigFieldErrors(image.config))
  const [jsonError, setJsonError] = useState(jsonErrorOf(fieldErrors))

  const throttle = useThrottling(IMAGE_WS_REQUEST_DELAY)
  const router = useRouter()
  const [deleteModalConfig, confirmDelete] = useConfirmation()
  const versionSock = useWebSocket(versionWsUrl(product.id, version.id))

  const editor = useEditorState(versionSock)
  const editorState = useItemEditorState(editor, versionSock, image.id)

  const onChange = (newConfig: Partial<ContainerConfig>) => {
    throttle(() => {
      const value = { ...config, ...newConfig }

      setConfig(value)

      const errors = getContainerConfigFieldErrors(value)
      setFieldErrors(errors)
      setJsonError(jsonErrorOf(errors))

      if (errors.length < 1) {
        versionSock.send(WS_TYPE_PATCH_IMAGE, {
          id: image.id,
          config: value,
        } as PatchImageMessage)
      }
    })
  }

  const onDelete = () =>
    confirmDelete(() => {
      versionSock.send(WS_TYPE_DELETE_IMAGE, {
        imageId: image.id,
      } as DeleteImageMessage)

      router.replace(versionUrl(product.id, version.id))
    })

  const pageLink: BreadcrumbLink = {
    name: t('common:image'),
    url: ROUTE_PRODUCTS,
  }

  const sublinks: BreadcrumbLink[] = [
    {
      name: product.name,
      url: productUrl(product.id),
    },
    {
      name: version.name,
      url: versionUrl(product.id, version.id),
    },
    {
      name: image.name,
      url: imageConfigUrl(product.id, version.id, image.id),
    },
  ]

  const getViewStateButtons = () => (
    <div className="flex">
      <DyoButton
        text
        thin
        textColor="text-bright"
        underlined={viewState === 'editor'}
        onClick={() => setViewState('editor')}
        heightClassName="pb-2"
        className="mx-8"
      >
        {t('editor')}
      </DyoButton>
      <DyoButton
        text
        thin
        textColor="text-bright"
        underlined={viewState === 'json'}
        onClick={() => setViewState('json')}
        className="mx-8"
        heightClassName="pb-2"
      >
        {t('json')}
      </DyoButton>
    </div>
  )

  return (
    <Layout title={t('common:image')}>
      <PageHeading pageLink={pageLink} sublinks={sublinks}>
        <DyoButton className="ml-2 px-6" color="bg-error-red" onClick={onDelete}>
          {t('common:delete')}
        </DyoButton>
      </PageHeading>

      <DyoCard className="p-4">
        <div className="flex mb-4 justify-between items-start">
          <DyoHeading element="h4" className="text-xl text-bright">
            {image.name}
            {image.name !== config?.name ? ` (${config?.name})` : null}
          </DyoHeading>

          {getViewStateButtons()}
        </div>
        {viewState === 'editor' && <ImageConfigFilters onChange={setFilters} />}
      </DyoCard>

      {viewState === 'editor' && (
        <DyoCard className="flex flex-col mt-4 px-4 w-full">
          <CommonConfigSection
            filters={filters}
            config={config}
            onChange={onChange}
            editorOptions={editorState}
            fieldErrors={fieldErrors}
          />
          <DagentConfigSection filters={filters} config={config} onChange={onChange} editorOptions={editorState} />
          <CraneConfigSection filters={filters} config={config} onChange={onChange} editorOptions={editorState} />
        </DyoCard>
      )}

      {viewState === 'json' && (
        <DyoCard className="flex flex-col mt-4 p-4 w-full">
          {jsonError ? (
            <DyoMessage message={jsonError} className="text-xs italic w-full mb-2" messageType="error" />
          ) : null}
          <EditImageJson
            config={config}
            editorOptions={editorState}
            onPatch={onChange}
            onParseError={err => setJsonError(err?.message)}
            convertConfigToJson={imageConfigToJsonContainerConfig}
          />
        </DyoCard>
      )}

      <DyoConfirmationModal
        config={deleteModalConfig}
        title={t('common:confirmDelete', { name: image.name })}
        description={t('common:deleteDescription', { name: image.name })}
        confirmText={t('common:delete')}
        className="w-1/4"
        confirmColor="bg-error-red"
      />
    </Layout>
  )
}

export default ImageDetailsPage

const getPageServerSideProps = async (context: NextPageContext) => {
  const { productId, versionId, imageId } = context.query

  const crux = cruxFromContext(context)
  const image = await crux.images.getById(imageId as string)
  const product = await crux.products.getById(productId as string)
  const version = await crux.versions.getById(versionId as string)

  return {
    props: {
      image,
      product,
      version,
    },
  }
}

export const getServerSideProps = withContextAuthorization(getPageServerSideProps)
