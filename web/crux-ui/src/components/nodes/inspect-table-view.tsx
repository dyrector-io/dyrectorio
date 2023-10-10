import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import { DyoLabel } from 'src/elements/dyo-label'
import { DyoList } from 'src/elements/dyo-list'

type KeyValue = {
  key: string
  value: string
}

interface KeyValueTableProps {
  data: KeyValue[]
  translateKeys?: boolean
}

const defaultHeaderClass = 'uppercase text-bright text-sm font-semibold bg-medium-eased px-2 py-3 h-11'

const KeyValueTable = (props: KeyValueTableProps) => {
  const { data, translateKeys } = props

  const { t } = useTranslation('nodes')

  const headers = ['common:key', 'common:value']

  const headerClasses = [clsx('rounded-tl-lg pl-4', defaultHeaderClass), clsx('rounded-tr-lg pr-4', defaultHeaderClass)]

  const columnWidths = ['w-1/2', 'w-1/2']
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2 line-clamp-1 text-ellipsis'
  const itemClasses = [clsx('pl-4', defaultItemClass), clsx('pr-4', defaultItemClass)]

  const itemBuilder = (item: KeyValue) => {
    const { key, value } = item

    const keyTranslate = translateKeys ? t(key) : key

    return [<span title={keyTranslate}>{keyTranslate}</span>, <span title={value}>{value}</span>]
  }

  return (
    <DyoList
      className="bg-dark-eased"
      headers={headers.map(it => t(it))}
      headerClassName={headerClasses}
      columnWidths={columnWidths}
      itemClassName={itemClasses}
      data={data}
      itemBuilder={itemBuilder}
    />
  )
}

interface MountsTableProps {
  data: any[]
}

const MountsTable = (props: MountsTableProps) => {
  const { data } = props

  const { t } = useTranslation('nodes')

  const headers = [
    'mountsInfo.type',
    'mountsInfo.source',
    'mountsInfo.dest',
    'mountsInfo.mode',
    'mountsInfo.rw',
    'mountsInfo.propagation',
  ]

  const headerClasses = [
    clsx('rounded-tl-lg pl-4', defaultHeaderClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultHeaderClass),
    clsx('rounded-tr-lg pr-4', defaultHeaderClass),
  ]

  const columnWidths = ['w-3/12', 'w-3/12', 'w-3/12', 'w-1/12', 'w-1/12', 'w-1/12']
  const defaultItemClass = 'h-12 min-h-min text-light-eased p-2 line-clamp-1 text-ellipsis'
  const itemClasses = [
    clsx('pl-4', defaultItemClass),
    ...Array.from({ length: headers.length - 2 }).map(() => defaultItemClass),
    clsx('pr-4', defaultItemClass),
  ]

  const itemBuilder = (item: any) => {
    const { Type: type, Source: source, Destination: dest, Mode: mode, RW: rw, Propagation: propagation } = item

    return [
      <span>{type}</span>,
      <span title={source}>{source}</span>,
      <span title={dest}>{dest}</span>,
      <span>{mode}</span>,
      <span>{rw}</span>,
      <span>{propagation}</span>,
    ]
  }

  return (
    <DyoList
      className="bg-dark-eased"
      headers={headers.map(it => t(it))}
      headerClassName={headerClasses}
      columnWidths={columnWidths}
      itemClassName={itemClasses}
      data={data}
      itemBuilder={itemBuilder}
    />
  )
}

interface InspectTableViewProps {
  inspect: any
}

const InspectTableView = (props: InspectTableViewProps) => {
  const { inspect } = props
  const {
    Id: id,
    Config: config,
    Image: imageHash,
    Name: name,
    RestartCount: restartCount,
    NetworkSettings: networkSettings,
    State: state,
    Mounts: mounts,
  } = inspect
  const { Env: env, Labels: labels, Image: image, Hostname: hostname } = config ?? {}
  const { Networks: networks, IPAddress: ipAddress } = networkSettings ?? {}
  const { Status: status, ExitCode: exitCode } = state ?? {}

  const { t } = useTranslation('nodes')

  const envTableData = (env ?? []).map(it => {
    const split = it.split('=')
    return {
      key: split[0],
      value: split[1],
    }
  })

  const labelsTableData = Object.entries(labels ?? {}).map(([key, value]) => ({ key, value: value as string }))

  const general: KeyValue[] = [
    {
      key: 'inspectGeneral.id',
      value: id,
    },
    {
      key: 'inspectGeneral.name',
      value: name,
    },
    {
      key: 'inspectGeneral.status',
      value: status,
    },
    {
      key: 'inspectGeneral.exitCode',
      value: exitCode,
    },
    {
      key: 'inspectGeneral.image',
      value: image,
    },
    {
      key: 'inspectGeneral.imageHash',
      value: imageHash,
    },
    {
      key: 'inspectGeneral.restartCount',
      value: restartCount,
    },
    {
      key: 'inspectGeneral.hostName',
      value: hostname,
    },
    {
      key: 'inspectGeneral.ip',
      value: ipAddress === '' ? '-' : ipAddress,
    },
  ]

  const networkTableData = Object.entries(networks ?? {}).map(([networkName, network]) => {
    const { IPAddress: ip, Gateway: gateway } = network as any

    return {
      key: networkName,
      value: t('networkInfo', {
        ip: ip === '' ? '-' : ip,
        gateway: gateway === '' ? '-' : gateway,
      }),
    }
  })

  const tableGroupHeaderClass = 'uppercase text-lg'

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 my-4">
        <div className="flex flex-col">
          <DyoLabel className={tableGroupHeaderClass}>{t('general')}</DyoLabel>
          <KeyValueTable data={general} translateKeys />
        </div>
        <div className="flex flex-col">
          <DyoLabel className={tableGroupHeaderClass}>{t('environment')}</DyoLabel>
          <KeyValueTable data={envTableData} />
        </div>
        <div className="flex flex-col">
          <DyoLabel className={tableGroupHeaderClass}>{t('labels')}</DyoLabel>
          <KeyValueTable data={labelsTableData} />
        </div>
        <div className="flex flex-col">
          <DyoLabel className={tableGroupHeaderClass}>{t('networks')}</DyoLabel>
          <KeyValueTable data={networkTableData} />
        </div>
      </div>
      <div className="flex flex-col">
        <DyoLabel className={tableGroupHeaderClass}>{t('mounts')}</DyoLabel>
        <MountsTable data={mounts ?? []} />
      </div>
    </>
  )
}

export default InspectTableView
