import dynamic from 'next/dynamic'

const ShEditor = dynamic(() => import('./sh-editor'), {
  ssr: false,
})

export default ShEditor
