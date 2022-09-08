import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface NavButtonProps {
  children: React.ReactNode
  href: string
  passHref?: boolean
  icon?: JSX.Element
}

const NavButton = (props: NavButtonProps) => {
  const { children, href, passHref, icon } = props

  const router = useRouter()

  const isActive = router.pathname.startsWith(href)

  return (
    <>
      <div className={clsx('pl-8 py-3', isActive ? 'bg-dark w-full' : null)}>
        <Link href={href} passHref={passHref}>
          <a>
            <div className="flex flex-row">
              <div className="flex items-center mr-2 text-bright text-sm font-semibold">{icon}</div>
              {children}
            </div>
          </a>
        </Link>
      </div>
      <div className={clsx('w-1 py-3', isActive ? 'bg-dyo-turquoise opacity-50' : null)}>&nbsp;</div>
    </>
  )
}

export default NavButton
