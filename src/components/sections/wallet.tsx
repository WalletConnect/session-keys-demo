import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import ConnectButton from '../ui/connect-button'

export default function WalletSection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <ConnectButton />
        </CardContent>
      </Card>
    </>
  )
}
