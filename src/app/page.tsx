'use client'
import ActionsSection from '@/components/sections/actions'
import InfoSection from '@/components/sections/info'
import PasskeySection from '@/components/sections/passkey'
import SessionKeySection from '@/components/sections/session-key'
import WalletSection from '@/components/sections/wallet'
import { useAccount } from 'wagmi'

export default function Home() {
  const { isConnected } = useAccount()
  return (
    <div className="w-3/4 sm:w-1/2 md:w-1/4 flex flex-col gap-3">
      <WalletSection />
      <InfoSection />
      <PasskeySection />
      {isConnected ? <ActionsSection /> : null}
      <SessionKeySection />
    </div>
  )
}
