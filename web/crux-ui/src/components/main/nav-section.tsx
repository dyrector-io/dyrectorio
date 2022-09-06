import useTranslation from 'next-translate/useTranslation'
import NavButton from './nav-button'

export interface MenuOption {
  text: string
  link: string
  icon: JSX.Element
}

interface NavSectionProps {
  title: string
  options: MenuOption[]
  className?: string
}

export const NavSection = (props: NavSectionProps) => {
  const { title, options, className } = props

  const { t } = useTranslation('common')

  return (
    <div className={className}>
      <p className="text-bright px-6 text-sm tracking-widest">{title.toUpperCase()}</p>
      <ul className="list-none flex flex-col text-bright">
        {options.map((option, index) => (
          <li key={index} className="flex flex-row items-center mt-2">
            <NavButton href={option.link} icon={option.icon}>
              {t(option.text)}
            </NavButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
