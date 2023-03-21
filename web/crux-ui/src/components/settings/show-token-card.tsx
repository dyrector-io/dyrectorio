import DyoButton from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoTextArea from '@app/elements/dyo-text-area'
import { GeneratedToken } from '@app/models'
import { writeToClipboard } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

interface ShowTokenCardProps {
  className?: string
  token: GeneratedToken
}

const ShowTokenCard = (props: ShowTokenCardProps) => {
  const { className, token } = props

  const { t } = useTranslation('settings')

  const onCopyToken = () => writeToClipboard(t, token.token)

  return (
    <DyoCard className={clsx('p-8', className)}>
      <DyoHeading element="h4" className="text-lg text-bright">
        {token.name}
      </DyoHeading>

      <DyoLabel textColor="text-dyo-orange">{t('settings:newTokenTips')}</DyoLabel>

      <div className="flex flex-row my-4">
        <DyoTextArea readOnly className="flex-grow pb-12 text-light" value={token.token} />
      </div>

      <DyoButton className="px-4 py-2 mr-auto" outlined onClick={onCopyToken}>
        {t('common:copy')}
      </DyoButton>
    </DyoCard>
  )
}

export default ShowTokenCard
