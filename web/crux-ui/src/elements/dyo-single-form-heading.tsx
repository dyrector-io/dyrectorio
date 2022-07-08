import clsx from 'clsx'
import { DyoHeading, DyoHeadingProps } from './dyo-heading'

const DyoSingleFormHeading = (props: DyoHeadingProps) => {
  return (
    <>
      <DyoHeading
        {...props}
        className={clsx('text-center text-bright text-4xl font-extrabold', props.className)}
      ></DyoHeading>

      <div className="bg-dyo-turquoise w-14 h-1 mx-auto mt-3" />
    </>
  )
}

export default DyoSingleFormHeading
