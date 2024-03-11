import { Button } from '@/components/ui/button'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { testDomain, testMessage, testTypes } from '@/consts/typedData'
import { parseEther } from 'viem'
import { useSendTransaction, useSignTypedData } from 'wagmi'

export default function BasicActions() {
  const { sendTransactionAsync, isPending: isSendTransactionPending } = useSendTransaction()
  const { toast } = useToast()
  const { signTypedDataAsync } = useSignTypedData()

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

  const onToastView = (txHash: string) => {
    // @ts-ignore
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank').focus()
  }

  return (
    <>
      <Button onClick={onSignTypedData}>Sign typed data</Button>
      <Button onClick={onSendTransaction} disabled={isSendTransactionPending}>
        {!isSendTransactionPending ? 'Send transaction' : 'Sending...'}
      </Button>
    </>
  )
}
