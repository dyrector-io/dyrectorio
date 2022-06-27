import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'

interface NavButtonProps {
  className?: string
  children: React.ReactNode
  href: string
  passHref?: boolean
}

export const NavButton = (props: NavButtonProps) => {
  const router = useRouter()

  return (
    <div className={props.className}>
      <Link href={props.href} passHref={props.passHref}>
        <a className="font-dyo-dark font-bold">{props.children}</a>
      </Link>

      {router.pathname !== props.href ? null : (
        <div className="bg-dyo-turquoise h-0.5 mt-1" />
      )}
    </div>
  )
}
