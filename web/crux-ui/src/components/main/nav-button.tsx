import DyoLink from '@app/elements/dyo-link'
import clsx from 'clsx'
import { useRouter } from 'next/router'

interface NavButtonProps {
  children: string
  href: string
  target?: string
  passHref?: boolean
  icon?: JSX.Element
}

const NavButton = (props: NavButtonProps) => {
  const { children, href, target, passHref, icon } = props

  const router = useRouter()

  const active = router.asPath.startsWith(href)

  return (
    <>
      <div className={clsx('pl-8 py-2', active ? 'bg-dark w-full' : null)}>
        <DyoLink href={href} passHref={passHref} target={target} qaLabel={`menu-item-${children}`}>
          <div className="flex flex-row">
            <div className="flex items-center mr-2 text-bright text-sm font-semibold">{icon}</div>
            {children}
          </div>
        </DyoLink>
      </div>

      <div className={clsx('w-1 py-2', active ? 'bg-dyo-turquoise opacity-50' : null)}>&nbsp;</div>
    </>
  )
}

export default NavButton
