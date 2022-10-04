import EditorBadge from '@app/components/editor/editor-badge'
import { ProductDetails, VersionDetails, VERSION_SECTIONS_STATE_VALUES } from '@app/models'
import { deploymentUrl } from '@app/routes'
import { parseStringUnionType } from '@app/utils'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useRef } from 'react'
import AddDeploymentCard from './deployments/add-deployment-card'
import SelectImagesCard from './images/select-images-card'
import { useImagesState, VersionSection } from './images/use-images-state'
import VersionDeploymentsSection from './version-deployments-section'
import VersionImagesSection from './version-images-section'
import VersionReorderImagesSection from './version-reorder-images-section'
import VersionSectionsHeading from './version-sections-heading'

export const parseVersionSectionState = (section: string, fallback: VersionSection) =>
  parseStringUnionType(section, fallback, VERSION_SECTIONS_STATE_VALUES)

interface VersionSectionsProps {
  product: ProductDetails
  version: VersionDetails
  setSaving: (saving: boolean) => void
  setTopBarContent: (node: React.ReactNode) => void
}

const VersionSections = (props: VersionSectionsProps) => {
  const { version, setSaving, setTopBarContent, product } = props

  const router = useRouter()

  const initialSection = parseVersionSectionState(router.query.section as string, 'images')

  const [state, actions] = useImagesState({
    initialSection,
    productId: product.id,
    version,
  })

  const { editors } = state

  useEffect(() => setSaving(state.saving), [setSaving, state.saving])

  useEffect(() => {
    const node = (
      <>
        {editors.map((it, index) => (
          <EditorBadge key={index} className="mr-2" editor={it} />
        ))}
      </>
    )

    setTopBarContent(node)
  }, [editors, setTopBarContent])

  const saveImageOrderRef = useRef<VoidFunction>()

  const onAddDeployment = async (deploymentId: string) =>
    router.push(deploymentUrl(product.id, version.id, deploymentId))

  return (
    <>
      {state.addSection === 'none' ? (
        <VersionSectionsHeading
          versionMutable={!version.mutable}
          state={state}
          actions={actions}
          saveImageOrderRef={saveImageOrderRef}
        />
      ) : state.addSection === 'image' ? (
        <SelectImagesCard onImagesSelected={actions.addImages} onDiscard={actions.discardAddSection} />
      ) : (
        <AddDeploymentCard
          productId={product.id}
          productName={product.name}
          versionId={version.id}
          onAdd={onAddDeployment}
          onDiscard={actions.discardAddSection}
        />
      )}

      {state.section === 'images' ? (
        <VersionImagesSection disabled={!version.mutable} state={state} actions={actions} />
      ) : state.section === 'deployments' ? (
        <VersionDeploymentsSection product={product} version={version} />
      ) : (
        <VersionReorderImagesSection images={state.images} saveRef={saveImageOrderRef} onSave={actions.orderImages} />
      )}
    </>
  )
}

export default VersionSections
