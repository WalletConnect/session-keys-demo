import { PASSKEY_LOCALSTORAGE_KEY } from '@/consts/storage'
import { useEffect, useState } from 'react'
import { useLocalStorageState } from './useLocalStorageState'
import { PasskeyLocalStorageFormat } from '@/core/passkeys'
import { setItem } from '@/core/storage'
import { P256Credential } from 'webauthn-p256'

type PasskeyStorageType = P256Credential | PasskeyLocalStorageFormat | undefined

const usePasskey = () => {
  const [passKey, setPasskey] = useLocalStorageState<PasskeyStorageType>(
    PASSKEY_LOCALSTORAGE_KEY,
    undefined
  )
  const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false)
  const [passkeyId, setPasskeyId] = useState("")
  const setNewPasskey = (value: PasskeyStorageType) => {
    setItem(PASSKEY_LOCALSTORAGE_KEY, '')
    setPasskey(value)
    setIsPasskeyAvailable(false)
  }

  useEffect(() => {
    if (passKey) {
      setIsPasskeyAvailable(true)
      setPasskeyId((passKey as P256Credential).id)
    }
  }, [passKey])

  return {
    isPasskeyAvailable,
    passKey,
    setPasskey: setNewPasskey,
    passkeyId
  }
}

export default usePasskey
