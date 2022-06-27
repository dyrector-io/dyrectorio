import Link from 'next/link'

interface NavButtonProps {
  className?: string
  children: React.ReactNode
  href: string
  passHref?: boolean
  icon?: JSX.Element
}

export const NavButton = (props: NavButtonProps) => {
  return (
    <div className={props.className}>
      <Link href={props.href} passHref={props.passHref}>
        <a className="text-bright font-bold">
          <div className="flex flex-row text-sm">
            <div className="flex flex-row items-center mr-2">{props.icon} </div>
            {props.children}
          </div>
        </a>
      </Link>
    </div>
  )
}
