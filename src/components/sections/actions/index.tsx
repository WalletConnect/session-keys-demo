import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { useSignTypedData, useWriteContract } from 'wagmi'
import { useToast } from '../../ui/use-toast'
import { parseEther } from 'viem'
import { donutContractAbi, donutContractaddress } from '@/consts/contract'
import { permissionsDomain, permissionsTypes } from '@/consts/typedData'
import { SESSIONKEY_LOCALSTORAGE_KEY } from '@/consts/storage'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import BasicActions from './basic'
import { useLocalSigner } from '@/hooks/useLocalSigner'

export default function ActionsSection() {
  const { toast } = useToast()
  const { signTypedDataAsync } = useSignTypedData()
  const { writeContractAsync } = useWriteContract()
  const [sessionKey, setSessionKey] = useLocalStorageState<string | undefined>(
    SESSIONKEY_LOCALSTORAGE_KEY,
    undefined
  )
  const { signer } = useLocalSigner()

  async function onRequestPermissions() {
    try {
      const targetAddress = signer?.address
      if (!targetAddress) {
        throw new Error('Local signer not initialized')
      }
      const serializedSessionKey = await signTypedDataAsync({
        domain: permissionsDomain,
        message: {
          targetAddress
        },
        primaryType: 'PermissionRequest',
        types: permissionsTypes
      })
      toast({ title: 'Success', description: 'Permissions granted successfully' })
      console.log('Permissions granted successfully', { serializedSessionKey })
      setSessionKey(serializedSessionKey)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to obtain permissions'
      })
      console.log(error)
    }
  }

  async function onPurchase() {
    try {
      const result = await writeContractAsync({
        abi: donutContractAbi,
        address: donutContractaddress,
        value: parseEther('0.0001'),
        functionName: 'purchase',
        args: [1]
      })
      toast({ title: 'Success', description: 'Donut purchased successfully' })
      console.log('Donut purchased successfully', { result })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase donut'
      })
      console.log(error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 grid-cols-2">
          <BasicActions />
          <CardTitle className="col-span-2 my-3">Permissions</CardTitle>
          <Button onClick={onRequestPermissions}>Request</Button>

          <CardTitle className="col-span-2 my-3">Donut contract</CardTitle>
          <Button onClick={onPurchase}>Purchase</Button>
        </CardContent>
      </Card>
    </>
  )
}
