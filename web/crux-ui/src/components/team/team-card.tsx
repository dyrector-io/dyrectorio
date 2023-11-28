import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import DyoLink from '@app/elements/dyo-link'
import { Team } from '@app/models'
import { teamUrl } from '@app/routes'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

type TeamStatItemProps = {
  icon: string
  count: number
  label: string
}

const TeamStatItem = (props: TeamStatItemProps) => {
  const { icon, count, label } = props

  return (
    <div className="flex flex-row flex-grow">
      <div className="mr-2 my-auto">
        <Image className="aspect-square" alt={icon} src={`/team-stats/${icon}.svg`} width={64} height={64} />
      </div>

      <div className="flex flex-col text-bright">
        <span className="text-3xl">{count}</span>
        <span>{label}</span>
      </div>
    </div>
  )
}

interface TeamCardProps {
  className?: string
  highlighted?: boolean
  team: Team
}

const TeamCard = (props: TeamCardProps) => {
  const { team, className, highlighted } = props

  const { t } = useTranslation('common')

  return (
    <DyoCard className={clsx('p-8', highlighted ? 'border border-dyo-turquoise' : null, className)}>
      <DyoLink href={teamUrl(team.id)} qaLabel="team-card-team-name">
        <DyoHeading element="h4" className="text-xl text-bright mb-4">
          {team.name}
        </DyoHeading>
      </DyoLink>

      <div className="flex flex-row">
        {Object.entries(team.statistics).map(([key, value]) => (
          <TeamStatItem key={key} icon={key} count={value} label={t(key)} />
        ))}
      </div>
    </DyoCard>
  )
}

export default TeamCard
