import { useLocalStorageState } from '@/hooks/useLocalStorageState'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { SESSIONKEY_LOCALSTORAGE_KEY } from '@/consts/storage'
import { useLocalSigner } from '@/hooks/useLocalSigner'
import { Button } from '../ui/button'
import { deserializeSessionKeyAccount } from '@zerodev/session-key'
import { useToast } from '../ui/use-toast'
import { bufferToString, createKernelClient, createPublicBundlerClient } from '@/lib/utils'
import { WalletClient, getContract, parseEther } from 'viem'
import { donutContractAbi, donutContractaddress } from '@/consts/contract'
import { useState } from 'react'
import { signWithPasskey } from '@/core/passkeys'
import usePasskey from '@/hooks/usePasskey'
import { removeItem } from '@/core/storage'
import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless'

export default function SessionKeySection() {
  const [sessionKey, setSessionKey] = useLocalStorageState<string | undefined>(
    SESSIONKEY_LOCALSTORAGE_KEY,
    undefined
  )
  const [isAsyncActionLoading, setIsAsyncActionLoading] = useState(false)
  const [isSyncActionLoading, setIsSyncActionLoading] = useState(false)
  const { isPasskeyAvailable } = usePasskey()

  const { toast } = useToast()
  const { signer } = useLocalSigner()

  const asyncSessionKeyAction = async () => {
    setIsAsyncActionLoading(true)
    try {
      if (!sessionKey) {
        throw new Error('Session key not available')
      }
      if (!signer) throw new Error('Local Signer not available')
      const publicClient = createPublicBundlerClient()
      const entryPoint = ENTRYPOINT_ADDRESS_V07
      const sessionKeyAccount = await deserializeSessionKeyAccount(
        publicClient,
        entryPoint,
        sessionKey,
        signer
      )
      const kernelClient = createKernelClient(sessionKeyAccount!)

      console.log('KERNEL CLIENT CREATED', kernelClient.account.address)
      const hash = await kernelClient.writeContract({
        abi: donutContractAbi,
        address: donutContractaddress,
        value: parseEther('0.0001'),
        functionName: 'purchase',
        args: [1]
      })
      console.log('CONTRACT WRITE SUCCESSFUL', hash)
      toast({
        title: 'Success',
        description: 'Async signing completed successfully'
      })
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Session key action failed'
      })
    } finally {
      setIsAsyncActionLoading(false)
    }
  }

  const syncSessionKeyAction = async () => {
    setIsSyncActionLoading(true)
    try {
      if (!sessionKey) {
        throw new Error('Session key not available')
      }

      const credential = await signWithPasskey(crypto.getRandomValues(new Uint8Array(32)))
      console.log('Signing complete', { credential })
      if (credential) {
        console.log('Passkey rawId', bufferToString(credential.rawId))
      }

      const publicClient = createPublicBundlerClient()
      const entryPoint = ENTRYPOINT_ADDRESS_V07
      const sessionKeyAccount = await deserializeSessionKeyAccount(
        publicClient,
        entryPoint,
        sessionKey,
        signer
      )
      const kernelClient = createKernelClient(sessionKeyAccount!)

      console.log('KERNEL CLIENT CREATED', kernelClient.account.address)
      const hash = await kernelClient.writeContract({
        abi: donutContractAbi,
        address: donutContractaddress,
        value: parseEther('0.0001'),
        functionName: 'purchase',
        args: [1]
      })
      console.log('CONTRACT WRITE SUCCESSFUL', hash)
      toast({
        title: 'Success',
        description: 'Sync signing completed successfully'
      })
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Session key action failed'
      })
    } finally {
      setIsSyncActionLoading(false)
    }
  }

  const handleClearSessionKey = () => {
    setSessionKey(undefined)
    removeItem(SESSIONKEY_LOCALSTORAGE_KEY)
    toast({
      title: 'Success',
      description: 'Session key removed successfully'
    })
  }

  return sessionKey ? (
    <Card>
      <CardHeader>
        <CardTitle>Session keys</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 grid-cols-2">
        <Button onClick={asyncSessionKeyAction} disabled={isAsyncActionLoading}>
          {!isAsyncActionLoading ? 'Async Signing' : 'Sending...'}
        </Button>
        {isPasskeyAvailable ? (
          <Button onClick={syncSessionKeyAction} disabled={isSyncActionLoading}>
            {!isSyncActionLoading ? 'Sync signing' : 'Sending...'}
          </Button>
        ) : (
          <Button variant="secondary" disabled={true}>
            Passkey unavailable
          </Button>
        )}
        <Button onClick={handleClearSessionKey} variant="outline">
          Clear key
        </Button>
      </CardContent>
    </Card>
  ) : null
}
