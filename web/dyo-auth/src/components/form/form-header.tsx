import clsx from 'clsx'
import React from 'react'

interface FormHeaderProps {
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  children: React.ReactNode
}

export const FormHeader = (props: FormHeaderProps) => {
  return (
    <>
      {React.createElement(
        props.element ?? 'h1',
        {
          className: clsx(
            'text-center text-dyo-dark-purple text-4xl font-extrabold',
            props.className,
          ),
        },
        props.children,
      )}

      <div className="flex justify-center mt-3 mb-8">
        <div className="bg-dyo-turquoise w-14 h-1" />
      </div>
    </>
  )
}
