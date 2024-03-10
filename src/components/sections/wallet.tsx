'use client'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import ConnectButton from '../ui/connect-button'
import { Button } from '../ui/button'

export default function WalletSection() {
  const { isConnected, address } = useAccount()

  const onExplorerClick = () => {
    // @ts-ignore
    window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank').focus()
  }
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <ConnectButton />
          {isConnected ? (
            <Button className="mt-2" variant="secondary" onClick={onExplorerClick}>
              Explorer
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
