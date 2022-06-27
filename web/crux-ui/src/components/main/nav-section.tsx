import useTranslation from 'next-translate/useTranslation'
import React from 'react'
import { NavButton } from './nav-button'

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
  const { t } = useTranslation('common')

  return (
    <div className={props.className}>
      <p className="text-bright text-sm tracking-widest">{props.title.toUpperCase()}</p>
      <ul className="list-none flex flex-col text-bright">
        {props.options.map((option, index) => (
          <li key={index} className="flex flex-row space-x-2 items-center mt-6 ml-4">
            <NavButton href={option.link} icon={option.icon}>
              {t(option.text)}
            </NavButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
