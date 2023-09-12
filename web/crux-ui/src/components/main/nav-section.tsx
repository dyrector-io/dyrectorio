import DyoIcon from '@app/elements/dyo-icon'
import useTranslation from 'next-translate/useTranslation'
import NavButton from './nav-button'

export type MenuOption = {
  text: string
  link: string
  target?: string
  icon: string
}

interface NavSectionProps {
  title: string
  options: MenuOption[]
  className?: string
}

export const NavSection = (props: NavSectionProps) => {
  const { title, options, className } = props

  const { t } = useTranslation('common')

  const optionToIcon = (it: MenuOption) => <DyoIcon src={it.icon} alt={t(it.text)} />

  return (
    <div className={className}>
      <p className="text-bright px-6 text-sm tracking-widest">{title.toUpperCase()}</p>
      <ul className="list-none flex flex-col text-bright">
        {options.map((option, index) => (
          <li key={index} className="flex flex-row items-center mt-auto">
            <NavButton href={option.link} icon={optionToIcon(option)} target={option.target}>
              {t(option.text)}
            </NavButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
