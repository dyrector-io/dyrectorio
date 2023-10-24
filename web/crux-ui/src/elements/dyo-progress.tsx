export interface DyoProgressProps {
  progress: number
  text: string
}

const DyoProgress = (props: DyoProgressProps) => {
  const { progress, text } = props

  const percent = Math.floor(progress * 1000) / 10

  return (
    <div className="relative w-full bg-light-grey-muted rounded-full overflow-hidden">
      <div
        className="z-40 absolute left-0 right-0 top-0 bottom-0 bg-dyo-orange py-1 text-sm font-medium text-white text-center p-0.5"
        style={{ width: `${Math.ceil(progress * 100)}%` }}
      />
      <div className="relative z-50 py-1 text-sm font-medium text-white text-center p-0.5 leading-none">
        {text} - {percent}%
      </div>
    </div>
  )
}

export default DyoProgress
