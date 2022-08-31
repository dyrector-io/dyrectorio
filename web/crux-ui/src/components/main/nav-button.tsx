import Link from 'next/link'

interface NavButtonProps {
  className?: string
  children: React.ReactNode
  href: string
  passHref?: boolean
  icon?: JSX.Element
}

const NavButton = (props: NavButtonProps) => {
  const { className, children, href, passHref, icon } = props

  return (
    <div className={className}>
      <Link href={href} passHref={passHref}>
        <a className="text-bright font-bold">
          <div className="flex flex-row text-sm">
            <div className="flex flex-row items-center mr-2">{icon} </div>
            {children}
          </div>
        </a>
      </Link>
    </div>
  )
}

export default NavButton
