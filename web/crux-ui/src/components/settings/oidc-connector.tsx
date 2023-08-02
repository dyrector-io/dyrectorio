import DyoButton from '@app/elements/dyo-button'
import DyoIcon from '@app/elements/dyo-icon'
import { OidcProvider } from '@app/models'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

export type OidcConnectorAction = 'link' | 'unlink'

type OidcConnectorProps = {
  className?: string
  provider: OidcProvider
  name: string
  action: OidcConnectorAction | null
  onModifyConnection: (provider: OidcProvider, action: OidcConnectorAction) => void
}

const OidcConnector = (props: OidcConnectorProps) => {
  const { className, provider, name, action, onModifyConnection } = props

  const { t } = useTranslation('settings')

  return (
    <>
      <div className={clsx('flex flex-row gap-4', className)}>
        <DyoIcon src={`/oidc/${provider}.svg`} size="lg" alt={name} />

        <span className="text-bright text-lg">{name}</span>
      </div>

      <DyoButton disabled={!action} secondary={action !== 'link'} onClick={() => onModifyConnection(provider, action)}>
        {t(action === 'link' ? 'connect' : 'remove')}
      </DyoButton>
    </>
  )
}

export default OidcConnector
