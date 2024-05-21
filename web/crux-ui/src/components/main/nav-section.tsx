import useTranslation from 'next-translate/useTranslation'
import NavButton from './nav-button'

export type MenuOption = {
  text: string
  link: string
  target?: string
  icon: string
}

type NavSectionProps = {
  title: string
  options: MenuOption[]
  className?: string
}

export const NavSection = (props: NavSectionProps) => {
  const { title, options, className } = props

  const { t } = useTranslation('common')

  return (
    <div className={className}>
      <p className="text-light px-6 text-sm tracking-widest">{title.toUpperCase()}</p>

      <ul className="list-none flex flex-col text-bright pt-2">
        {options.map((it, index) => (
          <li key={index} className="flex flex-row items-center">
            <NavButton activeIndicator href={it.link} icon={it.icon} text={t(it.text)} target={it.target} />
          </li>
        ))}
      </ul>
    </div>
  )
}
