import DyoButton from '@app/elements/dyo-button'
import useTranslation from 'next-translate/useTranslation'
import { NodeDetailsSection } from './use-node-details-state'

interface NodeSectionsHeadingProps {
  section: NodeDetailsSection
  setSection: (section: NodeDetailsSection) => void
}

const NodeSectionsHeading = (props: NodeSectionsHeadingProps) => {
  const { section, setSection } = props

  const { t } = useTranslation('nodes')

  return (
    <div className="flex flex-row my-4">
      <DyoButton
        text
        thin
        underlined={section === 'containers'}
        textColor="text-bright"
        className="mx-6"
        onClick={() => setSection('containers')}
      >
        {t('common:containers')}
      </DyoButton>

      <DyoButton
        text
        thin
        underlined={section === 'logs'}
        textColor="text-bright"
        className="mx-6"
        onClick={() => setSection('logs')}
      >
        {t('logs')}
      </DyoButton>

      <DyoButton
        text
        thin
        underlined={section === 'deployments'}
        textColor="text-bright"
        className="ml-6"
        onClick={() => setSection('deployments')}
      >
        {t('common:deployments')}
      </DyoButton>
    </div>
  )
}

export default NodeSectionsHeading
