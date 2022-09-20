import { ProductDetails, RegistryImages, VersionDetails, VersionImage } from '@app/models'
import { deploymentUrl } from '@app/routes'
import { parseStringUnionType } from '@app/utils'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'
import AddDeploymentCard from './deployments/add-deployment-card'
import SelectImagesCard from './images/select-images-card'
import { ImagesWebSocketOptions, imageTagKey, ImageTagsMap, useImagesWebSocket } from './use-images-websocket'
import VersionDeploymentsSection from './version-deployments-section'
import VersionImagesSection from './version-images-section'
import VersionReorderImagesSection from './version-reorder-images-section'
import VersionSectionsHeading from './version-sections-heading'

const ADD_SECTION_TO_SECTION: Record<VersionAddSectionState, VersionSectionsState> = {
  image: 'images',
  deployment: 'deployments',
  none: 'images',
}

export type VersionAddSectionState = 'image' | 'deployment' | 'none'

const VERSION_SECTIONS_STATE_VALUES = ['images', 'deployments', 'reorder'] as const
export type VersionSectionsState = typeof VERSION_SECTIONS_STATE_VALUES[number]

export const parseVersionSectionState = (section: string, fallback: VersionSectionsState) =>
  parseStringUnionType(section, fallback, VERSION_SECTIONS_STATE_VALUES)

interface VersionSectionsProps {
  product: ProductDetails
  version: VersionDetails
  setSaving: (saving: boolean) => void
}

const VersionSections = (props: VersionSectionsProps) => {
  const { version, setSaving, product } = props

  const router = useRouter()

  const initialSection = parseVersionSectionState(router.query.section as string, 'images')

  const [sectionState, setSectionState] = useState(initialSection)
  const [addSectionState, setAddSectionState] = useState<VersionAddSectionState>('none')
  const [images, setImages] = useState(version.images)
  const [imageTags, setImageTags] = useState<ImageTagsMap>({})
  const [viewMode, setViewMode] = useState('list')

  const wsOptions: ImagesWebSocketOptions = {
    productId: product.id,
    versionId: version.id,
    images,
    imageTags,
    setImages,
    setImageTags,
    setPatchingImage: setSaving,
  }
  const { versionSock, fetchImageTags, addImages, orderImages, patchImage } = useImagesWebSocket(wsOptions)

  const saveImageOrderRef = useRef<VoidFunction>()

  const onImagesSelected = (registryImages: RegistryImages[]) => {
    setAddSectionState('none')

    registryImages.forEach(it => {
      fetchImageTags(it)
    })

    addImages(registryImages)
  }

  const onAddDeployment = async (deploymentId: string) =>
    router.push(deploymentUrl(product.id, version.id, deploymentId))

  const onReorderImages = (imgs: VersionImage[]) => {
    const ids = imgs.map(it => it.id)
    orderImages(ids)

    const newImages = imgs.map((it, index) => ({
      ...it,
      order: index,
    }))

    setImages(newImages)
    setAddSectionState('none')
  }

  const onSelectAddSectionState = (state: VersionAddSectionState) => {
    setAddSectionState(state)
    setSectionState(ADD_SECTION_TO_SECTION[state])
  }

  const onImageTagSelected = (image: VersionImage, tag: string) => {
    const index = images.indexOf(image)
    const newImages = [...images]
    newImages[index] = {
      ...image,
      tag,
    }
    setImages(newImages)

    patchImage(image.id, tag)
  }

  const onFetchTags = (image: VersionImage) => {
    const key = imageTagKey(image.registryId, image.name)
    if (!imageTags[key]) {
      fetchImageTags({
        registryId: image.registryId,
        images: [image.name],
      })
    }
  }

  return (
    <>
      {addSectionState === 'none' ? (
        <VersionSectionsHeading
          viewModeVisible={sectionState === 'images'}
          viewMode={viewMode}
          versionMutable={!version.mutable}
          state={sectionState}
          onStateSelected={setSectionState}
          onAddStateSelected={onSelectAddSectionState}
          onSaveImageOrder={() => saveImageOrderRef.current()}
          onDiscardImageOrder={() => setAddSectionState('none')}
          onViewModeChanged={mode => setViewMode(mode)}
        />
      ) : addSectionState === 'image' ? (
        <SelectImagesCard onImagesSelected={onImagesSelected} onDiscard={() => setAddSectionState('none')} />
      ) : (
        <AddDeploymentCard
          productId={product.id}
          productName={product.name}
          versionId={version.id}
          onAdd={onAddDeployment}
          onDiscard={() => setAddSectionState('none')}
        />
      )}

      {sectionState === 'images' ? (
        <VersionImagesSection
          viewMode={viewMode}
          disabled={!version.mutable}
          images={images}
          imageTags={imageTags}
          versionSock={versionSock}
          onTagSelected={onImageTagSelected}
          onFetchTags={onFetchTags}
        />
      ) : sectionState === 'deployments' ? (
        <VersionDeploymentsSection product={product} version={version} />
      ) : (
        <VersionReorderImagesSection images={images} saveRef={saveImageOrderRef} onSave={onReorderImages} />
      )}
    </>
  )
}

export default VersionSections
