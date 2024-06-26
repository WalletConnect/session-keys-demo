import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { useAccount, useSignTypedData, useWriteContract } from 'wagmi'
import { useToast } from '../../ui/use-toast'
import { Hex, createWalletClient, custom, numberToHex, parseEther, toHex } from 'viem'
import { donutContractAbi, donutContractaddress } from '@/consts/contract'
import { permissionsDomain, permissionsTypes } from '@/consts/typedData'
import { SESSIONKEY_LOCALSTORAGE_KEY } from '@/consts/storage'
import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import BasicActions from './basic'
import { useLocalSigner } from '@/hooks/useLocalSigner'
import { useUserOpBuilder } from '@/hooks/useUserOpBuilder'
import { PermissionBuilderSampleData, getRandomBytes } from '@/lib/utils'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { sepolia } from 'viem/chains'
import { walletActionsErc7715 } from 'viem/experimental'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { encodeSecp256k1PublicKeyToDID } from '@/utils/CommonUtils'

export default function ActionsSection() {
  const { isConnected, connector } = useAccount()
  const { toast } = useToast()
  const [isRequestingPermissions, setRequestingPermissions] = useState(false)
  const [isPurchasingDonut, setPurchasingDonut] = useState(false)
  const { signTypedDataAsync } = useSignTypedData()
  const { writeContractAsync } = useWriteContract()
  const [sessionKey, setSessionKey] = useLocalStorageState<string | undefined>(
    SESSIONKEY_LOCALSTORAGE_KEY,
    undefined
  )
  const { signer } = useLocalSigner()
  const { getNonce, getCallData, getSignature } = useUserOpBuilder()

  async function handleBuildUserOp() {
    const permissionContext = toHex(getRandomBytes(20))
    const nonce = await getNonce({
      permissionContext,
      address: PermissionBuilderSampleData.address
    })
    console.log('getNonce', { nonce })
    const callData = await getCallData({
      permissionContext,
      address: PermissionBuilderSampleData.address,
      executions: PermissionBuilderSampleData.executions
    })
    console.log('getCallData', { callData })
    const signature = await getSignature({
      address: PermissionBuilderSampleData.address,
      userOp: PermissionBuilderSampleData.packedUserOpV7,
      permissionContext
    })
    console.log('getSignature', { signature })
  }

  async function onRequestPermissions() {
    console.log('Requesting 7715 permissions')

    setRequestingPermissions(true)
    try {
      const permissions = [
        {
          type: {
            custom: 'donut-purchase'
          },
          data: {
            target: donutContractaddress,
            abi: donutContractAbi,
            valueLimit: parseEther('10'),
            // @ts-ignore
            functionName: 'purchase'
          },
          policies: []
        }
      ]
      const targetAddress = signer?.address
      if (!targetAddress) {
        throw new Error('Local signer not initialized')
      }

      const _walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(
          (await connector?.getProvider()) as unknown as Awaited<
            ReturnType<(typeof EthereumProvider)['init']>
          >
        )
      }).extend(walletActionsErc7715())

      const grantPermissionsResponse = await _walletClient.grantPermissions({
        expiry: 1716846083638,
        permissions,
        signer: {
          type: 'key',
          data: {
            id: encodeSecp256k1PublicKeyToDID(signer.publicKey)
          }
        }
      })

      const serializedSessionKey = grantPermissionsResponse.permissionsContext

      toast({ title: 'Success', description: 'Permissions granted successfully' })
      console.log('Permissions granted successfully', { grantPermissionsResponse })
      setSessionKey(serializedSessionKey)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to obtain permissions'
      })
      console.log(error)
    } finally {
      setRequestingPermissions(false)
    }
  }

  async function onPurchase() {
    setPurchasingDonut(true)
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
    setPurchasingDonut(false)
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
          <Button onClick={onRequestPermissions} disabled={isRequestingPermissions}>
            {isRequestingPermissions ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Check on wallet
              </>
            ) : (
              <>Request Permission</>
            )}
          </Button>

          <CardTitle className="col-span-2 my-3">Donut contract</CardTitle>
          <Button onClick={onPurchase} disabled={isPurchasingDonut}>
            {isPurchasingDonut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Check on wallet
              </>
            ) : (
              <>Purchase</>
            )}
          </Button>

          <CardTitle className="col-span-2 my-3">Custom</CardTitle>
          <Button onClick={handleBuildUserOp}> Build UserOp</Button>
        </CardContent>
      </Card>
    </>
  )
}
