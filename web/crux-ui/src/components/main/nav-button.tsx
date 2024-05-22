import DyoIcon from '@app/elements/dyo-icon'
import DyoLink from '@app/elements/dyo-link'
import clsx from 'clsx'
import { useRouter } from 'next/router'

type NavButtonProps = {
  className?: string
  href: string
  target?: string
  icon: string
  text: string
  activeIndicator?: boolean
}

const NavButton = (props: NavButtonProps) => {
  const { className, activeIndicator, href, target, icon, text } = props

  const router = useRouter()

  const active = activeIndicator && router.asPath.startsWith(href)

  return (
    <>
      <div className={clsx(className ?? 'pl-8 py-1.5', active ? 'bg-dark w-full' : null)}>
        <DyoLink href={href} target={target} qaLabel={`menu-item-${text}`}>
          <div className="flex flex-row text-bright">
            <div className="flex items-center mr-2 text-bright text-sm font-semibold">
              <DyoIcon src={icon} alt={text} />
            </div>

            {text}
          </div>
        </DyoLink>
      </div>

      <div className={clsx('w-1 py-1.5', active ? 'bg-dyo-turquoise opacity-50' : null)}>&nbsp;</div>
    </>
  )
}

export default NavButton
