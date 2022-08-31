import { ReactNode } from 'react'

const DyoTooltip = ({ message, children }: { message: string; children: ReactNode }) => (
  <div className="relative group">
    {children}
    <div className="absolute top-0 flex flex-col items-center hidden mt-6 group-hover:flex">
      <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-600 shadow-lg rounded-md">
        {message}
      </span>
      <div className="w-3 h-3 -mt-8 rotate-45 bg-gray-600" />
    </div>
  </div>
)

export default DyoTooltip
