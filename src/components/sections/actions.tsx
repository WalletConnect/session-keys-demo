import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  useAccount,
  useSignTypedData,
  useSendTransaction,
  useWriteContract,
  useReadContract
} from 'wagmi'
import { useToast } from '../ui/use-toast'
import { parseEther } from 'viem'
import { ToastAction } from '../ui/toast'
import { donutContractAbi, donutContractaddress } from '@/consts/contract'
import { useEffect } from 'react'
import {
  permissionsDomain,
  permissionsMessage,
  permissionsTypes,
  testDomain,
  testMessage,
  testTypes
} from '@/consts/typedData'

export default function ActionsSection() {
  const { chain, address } = useAccount()
  const { toast } = useToast()
  const { signTypedDataAsync } = useSignTypedData()
  const { sendTransactionAsync, isPending: isSendTransactionPending } = useSendTransaction()
  const { writeContractAsync } = useWriteContract()
  const {
    data: donutData,
    isLoading: isReadDonutLoading,
    isError: isReadDonutError,
    refetch: refetchDonuts
  } = useReadContract({
    abi: donutContractAbi,
    address: donutContractaddress,
    functionName: 'getBalance',
    args: [address]
  })
  useEffect(() => {
    console.log({ isReadDonutLoading, donutData, isReadDonutError })
  }, [isReadDonutLoading, donutData, isReadDonutError])

  async function onSignTypedData() {
    try {
      const signature = await signTypedDataAsync({
        domain: testDomain,
        message: testMessage,
        primaryType: 'Mail',
        types: testTypes
      })
      toast({ title: 'Success', description: 'Data signed successfully' })
      console.log('Data signed successfully', { signature })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign message'
      })
      console.log(error)
    }
  }

  async function onRequestPermissions() {
    try {
      const serializedSessionKey = await signTypedDataAsync({
        domain: permissionsDomain,
        message: permissionsMessage,
        primaryType: 'PermissionRequest',
        types: permissionsTypes
      })
      toast({ title: 'Success', description: 'Permissions granted successfully' })
      console.log('Permissions granted successfully', { serializedSessionKey })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to obtain permissions'
      })
      console.log(error)
    }
  }

  async function onSendTransaction() {
    try {
      const hash = await sendTransactionAsync({
        to: '0xD8Ea779b8FFC1096CA422D40588C4c0641709890',
        value: parseEther('0.0001')
      })
      toast({
        title: 'Success',
        description: 'Transaction sent succesfully',
        action: (
          <ToastAction altText="Try again" onClick={() => onToastView(hash)}>
            View
          </ToastAction>
        )
      })
      console.log('Transaction sent succesfully', { hash })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send transaction'
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
      refetchDonuts()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to purchase donut'
      })
      console.log(error)
    }
  }

  const onToastView = (txHash: string) => {
    // @ts-ignore
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank').focus()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 grid-cols-2">
          <Button onClick={onSignTypedData}>Sign typed data</Button>
          <Button onClick={onSendTransaction} disabled={isSendTransactionPending}>
            {!isSendTransactionPending ? 'Send transaction' : 'Sending...'}
          </Button>

          <CardTitle className="col-span-2 my-3">Permissions</CardTitle>
          <Button onClick={onRequestPermissions}>Request</Button>

          <CardTitle className="col-span-2 my-3">Donut contract</CardTitle>
          <Button onClick={onPurchase}>Purchase</Button>
          {!isReadDonutLoading && !isReadDonutError ? (
            <p className="mt-1.5 ml-2">Donuts: {BigInt(donutData as string).toString()} </p>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
