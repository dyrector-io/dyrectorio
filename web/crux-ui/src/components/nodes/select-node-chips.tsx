import DyoChips from '@app/elements/dyo-chips'
import { DyoLabel } from '@app/elements/dyo-label'
import DyoMessage from '@app/elements/dyo-message'
import useTeamRoutes from '@app/hooks/use-team-routes'
import { DyoNode } from '@app/models'
import { fetcher } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useEffect } from 'react'
import useSWR from 'swr'

type SelectNodeChipsProps = {
  className?: string
  name: string
  selection: DyoNode | null
  onSelectionChange: (node: DyoNode) => Promise<void>
  errorMessage?: string | null
  onNodesFetched?: (nodes: DyoNode[] | null) => void
}

const SelectNodeChips = (props: SelectNodeChipsProps) => {
  const { className, name, selection, onSelectionChange, errorMessage, onNodesFetched } = props

  const { t } = useTranslation('common')
  const routes = useTeamRoutes()

  const { data: nodes, error: fetchError } = useSWR<DyoNode[]>(routes.node.api.list(), fetcher)

  useEffect(() => {
    onNodesFetched?.call(null, nodes)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes])

  return fetchError ? (
    <DyoLabel>
      {t('errors:fetchFailed', {
        type: t('common:nodes'),
      })}
    </DyoLabel>
  ) : !nodes ? (
    <DyoLabel>{t('common:loading')}</DyoLabel>
  ) : nodes.length === 0 ? (
    <DyoMessage message={t('common:noNameFound', { name: t('common:node') })} messageType="error" />
  ) : (
    <>
      <DyoChips
        className={className}
        name={name}
        choices={nodes ?? []}
        converter={(it: DyoNode) => it.name}
        selection={selection}
        onSelectionChange={onSelectionChange}
      />
      {errorMessage && <DyoMessage message={errorMessage} messageType="error" />}
    </>
  )
}

export default SelectNodeChips
