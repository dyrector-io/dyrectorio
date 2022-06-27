import Image from 'next/image'
import { useState } from 'react'

type InplaceConfirmationProps = {
  onConfirm: () => Promise<void>
}

const InplaceConfirmation = (props: InplaceConfirmationProps) => {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const onConfirm = async () => {
    setLoading(true)
    setConfirming(false)
    await props.onConfirm()
    setLoading(false)
  }

  return loading ? (
    <p>Loading...</p> // TODO replace loading... with an indicator
  ) : !confirming ? (
    <button onClick={() => setConfirming(true)}>
      <Image src="/menu-close-icon.svg" width={16} height={16} />
    </button>
  ) : (
    <>
      <button onClick={() => onConfirm()}>
        <Image src="/button-positive.svg" width={32} height={32} />
      </button>
      <button onClick={() => setConfirming(false)}>
        <Image src="/button-negative.svg" width={32} height={32} />
      </button>
    </>
  )
}

export default InplaceConfirmation
