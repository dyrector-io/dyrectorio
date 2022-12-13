import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'

const Footer = (props: React.HTMLProps<HTMLDivElement>) => {
  const { className, ...forwardProps } = props

  const { t } = useTranslation('common')

  return (
    <footer className={clsx('font-poppins items-center flex py-6 justify-between', className)} {...forwardProps}>
      <div className="flex items-stretch text-sm">
        <span className="text-light pr-2">Copyright © {new Date().getFullYear()}</span>
      </div>
      <div className="flex items-stretch text-sm">
        <span className="text-light pr-2">
          <Link href="https://github.com/dyrector-io/dyrectorio" passHref target="_blank">
            <span className="text-dyo-turquoise font-bold">dyrector.io</span>
          </Link>{' '}
          {t('openSource')}
        </span>
      </div>
    </footer>
  )
}

export default Footer
