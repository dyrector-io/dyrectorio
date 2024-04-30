import dynamic from 'next/dynamic'

const YamlEditor = dynamic(() => import('./yaml-editor'), {
  ssr: false,
})

export default YamlEditor
