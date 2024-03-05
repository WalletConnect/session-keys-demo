'use client'
import usePasskey from '@/hooks/usePasskey'
import { Button } from '../ui/button'
import { createPasskey, signWithPasskey, toLocalStorageFormat } from '@/core/passkeys'
import { bufferToString } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function PasskeySection() {
  const { isPasskeyAvailable, setPasskey } = usePasskey()
  const { toast } = useToast()

  const handleCreatePasskey = async () => {
    try {
      const passkey = await createPasskey()

      setPasskey(toLocalStorageFormat(passkey))
      toast({
        title: 'Passkey created succesfully'
      })
    } catch (error) {
      console.error('Unable to create passkey', { error })
    }
  }

  const handleSign = async () => {
    try {
      const credential = await signWithPasskey(crypto.getRandomValues(new Uint8Array(32)))
      console.log('Signing complete', { credential })
      if (credential) {
        console.log('Passkey rawId', bufferToString(credential.rawId))
      }
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
