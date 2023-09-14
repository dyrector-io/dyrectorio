import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoExpandableText from '@app/elements/dyo-expandable-text'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoTag from '@app/elements/dyo-tag'
import { Template } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import TemplateImage from './template-image'

export interface TemplateCardProps {
  template: Template
  onAddClick: VoidFunction
}

const TemplateCard = (props: TemplateCardProps) => {
  const { template: propsTemplate, onAddClick } = props
  const { name, description, technologies } = propsTemplate

  const { t } = useTranslation('templates')

  return (
    <DyoCard className="p-6 flex flex-col flex-grow w-full">
      <div className="flex flex-col w-full">
        <div className="flex flex-row">
          <TemplateImage templateId={propsTemplate.id} />

          <div className="flex flex-col flex-grow">
            <DyoHeading element="h5" className="text-lg text-bright ml-4">
              {name}
            </DyoHeading>
          </div>

          <DyoButton className="ml-auto px-4" onClick={onAddClick}>
            {t('common:add')}
          </DyoButton>
        </div>
        <DyoExpandableText
          text={description}
          lineClamp={2}
          className="text-md text-bright mt-4 line-clamp-2 max-h-44"
          buttonClassName="ml-auto"
          modalTitle={name}
        />
        <div className="w-2/12 flex">
          {technologies.map((it, key) => (
            <DyoTag className="text-center mx-auto mr-4" key={key}>
              {it}
            </DyoTag>
          ))}
        </div>
      </div>
    </DyoCard>
  )
}

export default TemplateCard
