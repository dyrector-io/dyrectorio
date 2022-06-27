import dynamic from 'next/dynamic'

const JsonEditor = dynamic(() => import('./json-editor'), {
  ssr: false,
})

export default JsonEditor
