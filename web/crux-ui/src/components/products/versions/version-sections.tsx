import { ProductDetails, RegistryImages, VersionDetails, VersionImage } from '@app/models'
import { deploymentUrl } from '@app/routes'
import { parseStringUnionType } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'
import AddDeploymentCard from './deployments/add-deployment-card'
import SelectImagesCard from './images/select-images-card'
import { ImagesWebSocketOptions, ImageTagsMap, useImagesWebSocket } from './use-images-websocket'
import VersionDeploymentsSection from './version-deployments-section'
import VersionImagesSection from './version-images-section'
import VersionReorderImagesSection from './version-reorder-images-section'
import VersionSectionsHeading from './version-sections-heading'

interface VersionSectionsProps {
  product: ProductDetails
  version: VersionDetails
  setSaving: (saving: boolean) => void
}

const VersionSections = (props: VersionSectionsProps) => {
  const { t } = useTranslation('')

  const router = useRouter()

  const { version, setSaving } = props

  const initialSection = parseVersionSectionState(router.query.section as string, 'images')

  const [sectionState, setSectionState] = useState(initialSection)
  const [addSectionState, setAddSectionState] = useState<VersionAddSectionState>('none')
  const [images, setImages] = useState(props.version.images)
  const [imageTags, setImageTags] = useState<ImageTagsMap>({})

  const wsOptions: ImagesWebSocketOptions = {
    productId: props.product.id,
    versionId: props.version.id,
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
    router.push(deploymentUrl(props.product.id, props.version.id, deploymentId))

  const onReorderImages = (images: VersionImage[]) => {
    const ids = images.map(it => it.id)
    orderImages(ids)

    const newImages = images.map((it, index) => {
      return {
        ...it,
        order: index,
      }
    })

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

  return (
    <>
      {addSectionState === 'none' ? (
        <VersionSectionsHeading
          versionMutable={!version.mutable}
          state={sectionState}
          onStateSelected={setSectionState}
          onAddStateSelected={onSelectAddSectionState}
          onSaveImageOrder={() => saveImageOrderRef.current()}
          onDiscardImageOrder={() => setAddSectionState('none')}
        />
      ) : addSectionState === 'image' ? (
        <SelectImagesCard onImagesSelected={onImagesSelected} onDiscard={() => setAddSectionState('none')} />
      ) : (
        <AddDeploymentCard
          productId={props.product.id}
          productName={props.product.name}
          versionId={props.version.id}
          versionName={props.version.name}
          onAdd={onAddDeployment}
          onDiscard={() => setAddSectionState('none')}
        />
      )}

      {sectionState === 'images' ? (
        <VersionImagesSection
          disabled={!version.mutable}
          images={images}
          imageTags={imageTags}
          productId={props.product.id}
          versionId={version.id}
          versionSock={versionSock}
          onTagSelected={onImageTagSelected}
        />
      ) : sectionState === 'deployments' ? (
        <VersionDeploymentsSection product={props.product} version={version} />
      ) : (
        <VersionReorderImagesSection
          product={props.product}
          images={images}
          saveRef={saveImageOrderRef}
          onSave={onReorderImages}
        />
      )}
    </>
  )
}

const ADD_SECTION_TO_SECTION: Record<VersionAddSectionState, VersionSectionsState> = {
  image: 'images',
  deployment: 'deployments',
  none: 'images',
}

export default VersionSections

export type VersionAddSectionState = 'image' | 'deployment' | 'none'

const VERSION_SECTIONS_STATE_VALUES = ['images', 'deployments', 'reorder'] as const
export type VersionSectionsState = typeof VERSION_SECTIONS_STATE_VALUES[number]

export const parseVersionSectionState = (section: string, fallback: VersionSectionsState) =>
  parseStringUnionType(section, fallback, VERSION_SECTIONS_STATE_VALUES)
