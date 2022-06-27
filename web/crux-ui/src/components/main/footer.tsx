import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'

const Footer = (props: React.HTMLProps<HTMLDivElement>) => {
  const { className, ...forwardProps } = props

  const { t } = useTranslation('common')

  return (
    <footer className={clsx('font-poppins items-center flex py-6 justify-between', className)} {...forwardProps}>
      <div className="flex items-stretch text-sm">
        <span className="text-light pr-2">Copyright © {new Date().getFullYear()}</span>
        <span className="text-dyo-turquoise font-bold">dyrector.io</span>
      </div>
      <div className="flex items-stretch text-sm">
        <span className="text-light pr-2">Hand-crafted &amp; Made with</span>
        <Image src="/heart.svg" alt={t('heart')} width={20} height={20} />
      </div>
    </footer>
  )
}

export default Footer
