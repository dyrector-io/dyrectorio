import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface NavButtonProps {
  children: React.ReactNode
  href: string
  passHref?: boolean
  icon?: JSX.Element
}

export const NavButton = (props: NavButtonProps) => {
  const router = useRouter()

  const isActive = router.pathname === props.href

  return (
    <>
      <div className={clsx('w-1 py-3', isActive ? 'bg-dyo-turquoise' : null)}>&nbsp;</div>
      <div className={clsx('pl-8 py-3', isActive ? 'bg-dark w-full' : null)}>
        <Link href={props.href} passHref={props.passHref}>
          <a>
              <div className="flex flex-row">
                <div className="flex items-center mr-2 text-bright text-sm font-semibold">{props.icon}</div>
                {props.children}
            </div>
          </a>
        </Link>
      </div>
    </>
  )
}
