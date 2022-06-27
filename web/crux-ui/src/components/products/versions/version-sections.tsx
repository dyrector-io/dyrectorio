import { defaultWsErrorHandler } from '@app/errors'
import { useWebSocket } from '@app/hooks/use-websocket'
import {
  AddImagesMessage,
  ContainerImage,
  FetchImageTagsMessage,
  FindImageResult,
  ImagesWereReorderedMessage,
  OrderImagesMessage,
  ProductDetails,
  Registry,
  VersionDetails,
  WS_TYPE_ADD_IMAGES,
  WS_TYPE_DYO_ERROR,
  WS_TYPE_IMAGES_WERE_REORDERED,
  WS_TYPE_IMAGE_UPDATED,
  WS_TYPE_ORDER_IMAGES,
  WS_TYPE_PATCH_IMAGE,
  WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS,
} from '@app/models'
import { deploymentUrl, versionWsUrl, WS_REGISTRIES } from '@app/routes'
import { parseStringUnionType } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import AddDeploymentCard from './deployments/add-deployment-card'
import SelectImagesCard from './images/select-images-card'
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

  const saveImageOrderRef = useRef<VoidFunction>()

  const registriesSock = useWebSocket(WS_REGISTRIES, {
    onError: e => {
      console.error('ws', 'registries', e)
      toast(t('errors:connectionLost'))
    },
  })

  registriesSock.on(WS_TYPE_DYO_ERROR, defaultWsErrorHandler(t))

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
      } else if (message.type === WS_TYPE_DYO_ERROR) {
        handleWsError(message.payload)
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

  const onImagesSelected = (registry: Registry, images: FindImageResult[]) => {
    setAddSectionState('none')

    registriesSock.send(WS_TYPE_REGISTRY_FETCH_IMAGE_TAGS, {
      registryId: registry.id,
      images: images.map(it => it.name),
    } as FetchImageTagsMessage)

    versionSock.send(WS_TYPE_ADD_IMAGES, {
      registryId: registry.id,
      images: images.map(it => it.name),
    } as AddImagesMessage)
  }

  const onAddDeployment = async (deploymentId: string) =>
    router.push(deploymentUrl(props.product.id, props.version.id, deploymentId))

  const onReorderImages = (images: ContainerImage[]) => {
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
          productId={props.product.id}
          versionId={version.id}
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
