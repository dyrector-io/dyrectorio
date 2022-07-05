import Image from 'next/image'

interface LoadingIndicatorProps {
  className?: string
}

const LoadingIndicator = (props: LoadingIndicatorProps) => {
  return (
    <div className={props.className}>
      <Image className="animate-spin" src="/loading.svg" alt="loading" width={24} height={24} />
    </div>
  )
}

export default LoadingIndicator
