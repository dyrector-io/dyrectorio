import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { Team } from '@app/models'
import { teamUrl } from '@app/routes'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'

interface TeamCardProps {
  className?: string
  highlighted?: boolean
  team: Team
}

const TeamCard = (props: TeamCardProps) => {
  const { t } = useTranslation('common')

  const { team } = props

  return (
    <DyoCard className={clsx('p-8', props.highlighted ? 'border border-dyo-turquoise' : null, props.className)}>
      <Link href={teamUrl(team.id)} passHref>
        <a>
          <DyoHeading element="h4" className="text-xl text-bright mb-4">
            {team.name}
          </DyoHeading>
        </a>
      </Link>

      <div className="flex flex-row">
        {Object.entries(props.team.statistics).map(([key, value]) => (
          <TeamStatItem key={key} icon={key} count={value} label={t(key)} />
        ))}
      </div>
    </DyoCard>
  )
}

type TeamStatItemProps = {
  icon: string
  count: number
  label: string
}

const TeamStatItem = (props: TeamStatItemProps) => {
  return (
    <div className="flex flex-row flex-grow">
      <div className="mr-2 my-auto">
        <Image alt={props.icon} src={`/team-stats/${props.icon}.svg`} width={64} height={64} />
      </div>

      <div className="flex flex-col text-bright">
        <span className="text-3xl">{props.count}</span>
        <span>{props.label}</span>
      </div>
    </div>
  )
}

export default TeamCard
