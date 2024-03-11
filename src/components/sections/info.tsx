import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { donutContractAbi, donutContractaddress } from '@/consts/contract'
import { Button } from '../ui/button'
import { useToast } from '../ui/use-toast'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import { LAST_USED_ADDRESS_KEY } from '@/consts/storage'
import { useEffect } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export default function InfoSection() {
  const { address } = useAccount()
  const { toast } = useToast()
  const [lastUsedAddress, setLastUsedAddress] = useLocalStorageState<string | undefined>(
    LAST_USED_ADDRESS_KEY,
    address
  )
  const {
    data: donutData,
    isLoading: isReadDonutLoading,
    isError: isReadDonutError,
    refetch: refetchDonuts
  } = useReadContract({
    abi: donutContractAbi,
    address: donutContractaddress,
    functionName: 'getBalance',
    args: [lastUsedAddress]
  })

  useEffect(() => {
    if (address) {
      setLastUsedAddress(address)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const onRefreshDonuts = () => {
    refetchDonuts()
    toast({ title: 'Success', description: 'Donut count refreshed successfully' })
  }

  const onClearAddress = () => {
    setLastUsedAddress(undefined)
    toast({ title: 'Success', description: 'Last used address cleared successfully' })
  }

  return (
    <>
      {!isReadDonutLoading && !isReadDonutError && donutData ? (
        <Card>
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 grid-cols-2">
            {!address && lastUsedAddress ? (
              <div className="col-span-2 grid gap-2 my-3">
                <Label>Last used address</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    type="text"
                    value={lastUsedAddress}
                    readOnly={true}
                    className="col-span-3"
                  />
                  <Button variant="secondary" onClick={onClearAddress}>
                    Clear
                  </Button>
                </div>
              </div>
            ) : null}

            <p className="mt-1.5">🍩 Donuts owned: {BigInt(donutData as string).toString()} </p>
            <Button variant="outline" onClick={onRefreshDonuts}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </>
  )
}
