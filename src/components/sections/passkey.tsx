'use client'
import usePasskey from '@/hooks/usePasskey'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useToast } from '@/components/ui/use-toast'
import { createCredential, sign } from 'webauthn-p256'
import { toHex } from 'viem'

export default function PasskeySection() {
  const { isPasskeyAvailable, setPasskey, passkeyId } = usePasskey()
  const { toast } = useToast()

  const handleCreatePasskey = async () => {
    try {
      const credential = await createCredential({
        name: 'Session key'
      })
      setPasskey(credential)
      toast({
        title: 'Passkey created succesfully'
      })
    } catch (error) {
      console.error('Unable to create passkey', { error })
    }
  }

  const handleSign = async () => {
    try {
      const signature = await sign({
        credentialId: passkeyId,
        hash: toHex(crypto.getRandomValues(new Uint8Array(32)))
      })
      console.log('Signing complete', { signature })
      toast({
        title: 'Signing with passkey successfully completed'
      })
    } catch (error) {
      console.log('Signing error', error)
      toast({
        title: 'Error while trying to sign with passkey'
      })
    }
  }

  const handleClear = () => {
    console.log('Passkey cleared')
    toast({
      title: 'Passkey cleared successfully'
    })
    setPasskey(undefined)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Passkey management</CardTitle>
        </CardHeader>
        <CardContent>
          {isPasskeyAvailable ? (
            <div className="flex flex-col gap-2">
              <Button onClick={handleSign}>Sign with passkey</Button>
              <Button onClick={handleClear} variant="secondary">
                Clear passkey
              </Button>
            </div>
          ) : (
            <Button onClick={handleCreatePasskey}>Create Passkey</Button>
          )}
        </CardContent>
      </Card>
    </>
  )
}
