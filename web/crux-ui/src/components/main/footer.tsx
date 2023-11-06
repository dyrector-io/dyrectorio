import DyoLink from '@app/elements/dyo-link'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'

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
          <DyoLink
            href="https://github.com/dyrector-io/dyrectorio"
            passHref
            target="_blank"
            qaLabel="footer-dyrector-io-github"
          >
            <span className="text-dyo-turquoise font-bold">dyrector.io</span>
          </DyoLink>{' '}
          {t('openSource')}
        </span>
      </div>
    </footer>
  )
}

export default Footer
