import { useWebSocket } from '@app/hooks/use-websocket'
import {
  AddImagesMessage,
  DeleteImageMessage,
  FetchImageTagsMessage,
  GetImageMessage,
  ImageMessage,
  ImagesAddedMessage,
  ImagesWereReorderedMessage,
  ImageTagsMap,
  ImageUpdateMessage,
  OrderImagesMessage,
  PatchImageMessage,
  ProductDetails,
  RegistryImages,
  RegistryImageTags,
  RegistryImageTagsMessage,
  VersionDetails,
  VersionImage,
  WS_TYPE_ADD_IMAGES,
  WS_TYPE_DYO_ERROR,
  WS_TYPE_GET_IMAGE,
  WS_TYPE_IMAGE,
  WS_TYPE_IMAGES_ADDED,
  WS_TYPE_IMAGES_WERE_REORDERED,
  WS_TYPE_IMAGE_DELETED,
  WS_TYPE_IMAGE_UPDATED,
  WS_TYPE_ORDER_IMAGES,
  WS_TYPE_PATCH_IMAGE,
  WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS,
  WS_TYPE_REGISTRY_IMAGE_TAGS,
} from '@app/models'
import { deploymentUrl, versionWsUrl, WS_REGISTRIES } from '@app/routes'
import { fold, parseStringUnionType } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AddDeploymentCard from './deployments/add-deployment-card'
import SelectImagesCard from './images/select-images-card'
import VersionDeploymentsSection from './version-deployments-section'
import VersionImagesSection, { mergeImagePatch } from './version-images-section'
import VersionReorderImagesSection from './version-reorder-images-section'
import VersionSectionsHeading from './version-sections-heading'

interface VersionSectionsProps {
  product: ProductDetails
  version: VersionDetails
  setSaving: (saving: boolean) => void
}

const imageTagKey = (registryId: string, imageName: string) => `${registryId}/${imageName}`

const VersionSections = (props: VersionSectionsProps) => {
  const { t } = useTranslation('')

  const router = useRouter()

  const { version, setSaving } = props

  const initialSection = parseVersionSectionState(router.query.section as string, 'images')

  const [sectionState, setSectionState] = useState(initialSection)
  const [addSectionState, setAddSectionState] = useState<VersionAddSectionState>('none')
  const [images, setImages] = useState(props.version.images)
  const [imageTags, setImageTags] = useState<ImageTagsMap>({})

  const saveImageOrderRef = useRef<VoidFunction>()

  const registriesSock = useWebSocket(WS_REGISTRIES, {
    onOpen: () => {
      updateImageTags(images)
    },
    onError: e => {
      console.error('ws', 'registries', e)
      toast(t('errors:connectionLost'))
    },
  })

  const updateImageTags = (images: VersionImage[]) => {
    const fetchTags = fold(images, new Map<string, Set<string>>(), (map, it) => {
      let names = map.get(it.registryId)
      if (!names) {
        names = new Set()
        map.set(it.registryId, names)
      }

      names.add(it.name)
      return map
    })

    fetchTags.forEach((names, registryId) => {
      registriesSock.send(WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS, {
        registryId,
        images: Array.from(names),
      } as FetchImageTagsMessage)
    })
  }

  registriesSock.on(WS_TYPE_DYO_ERROR, defaultWsErrorHandler(t))

  registriesSock.on(WS_TYPE_REGISTRY_IMAGE_TAGS, (message: RegistryImageTagsMessage) => {
    if (message.images.length < 1) {
      return
    }

    const tags = { ...imageTags }
    message.images.forEach(it => {
      const key = imageTagKey(message.registryId, it.name)
      tags[key] = it
    })
    setImageTags(tags)
  })

  const handleWsError = defaultWsErrorHandler(t)

  const versionSock = useWebSocket(versionWsUrl(props.product.id, version.id), {
    onSend: message => {
      if (message.type === WS_TYPE_PATCH_IMAGE) {
        setSaving(true)
      }
    },
    onReceive: message => {
      if (WS_TYPE_IMAGE_UPDATED === message.type) {
        setSaving(false)
      }
    },
    onError: e => {
      console.error('ws', 'version', e)
      toast(t('errors:connectionLost'))
    },
  })

  versionSock.on(WS_TYPE_IMAGES_WERE_REORDERED, (message: ImagesWereReorderedMessage) => {
    const ids = [...message]

    const newImages = ids.map((id, index) => {
      const image = images.find(it => it.id === id)
      return {
        ...image,
        order: index,
      }
    })

    setImages(newImages)
  })

  versionSock.on(WS_TYPE_IMAGES_ADDED, (message: ImagesAddedMessage) => {
    const newImages = [...images, ...message.images]
    setImages(newImages)
    updateImageTags(newImages)
  })

  versionSock.on(WS_TYPE_IMAGE, (message: ImageMessage) => {
    const newImages = [...images, message]
    setImages(newImages)
    updateImageTags(newImages)
  })

  versionSock.on(WS_TYPE_IMAGE_UPDATED, (message: ImageUpdateMessage) => {
    const index = images.findIndex(it => it.id === message.id)
    if (index < 0) {
      versionSock.send(WS_TYPE_GET_IMAGE, {
        id: message.id,
      } as GetImageMessage)
      return
    }

    const oldImage = images[index]
    const image = mergeImagePatch(oldImage, message)

    const newImages = [...images]
    newImages[index] = image

    setImages(newImages)
    updateImageTags(newImages)
  })

  versionSock.on(WS_TYPE_IMAGE_DELETED, (message: DeleteImageMessage) => {
    setImages(images.filter(it => it.id !== message.imageId))
  })

  const onImagesSelected = (registryImages: RegistryImages[]) => {
    setAddSectionState('none')

    registryImages.forEach(it => {
      registriesSock.send(WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS, it)
    })

    versionSock.send(WS_TYPE_ADD_IMAGES, {
      registryImages,
    } as AddImagesMessage)
  }

  const onAddDeployment = async (deploymentId: string) =>
    router.push(deploymentUrl(props.product.id, props.version.id, deploymentId))

  const onReorderImages = (images: VersionImage[]) => {
    const ids = images.map(it => it.id)
    versionSock.send(WS_TYPE_ORDER_IMAGES, ids as OrderImagesMessage)

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

    versionSock.send(WS_TYPE_PATCH_IMAGE, {
      id: image.id,
      tag,
    } as PatchImageMessage)
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
          versionId={props.version.id}
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
