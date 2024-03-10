'use client'
import ActionsSection from '@/components/sections/actions'
import LoadingSection from '@/components/sections/loading'
import PasskeySection from '@/components/sections/passkey'
import WalletSection from '@/components/sections/wallet'
import { useAccount } from 'wagmi'

export default function Home() {
  const { isConnected, isConnecting } = useAccount()
  return (
    <div className="w-3/4 sm:w-1/2 md:w-1/4 flex flex-col gap-3">
      <WalletSection />
      {isConnected ? <PasskeySection /> : isConnecting ? <LoadingSection /> : null}
      {isConnected ? <ActionsSection /> : null}
    </div>
  )
}
