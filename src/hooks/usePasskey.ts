import { PASSKEY_LOCALSTORAGE_KEY } from "@/consts/storage"
import { useEffect, useState } from "react"
import { useLocalStorageState } from "./useLocalStorageState"
import { PasskeyLocalStorageFormat } from "@/core/passkeys"
import { setItem } from "@/core/storage"

type PasskeyStorageType = PasskeyLocalStorageFormat | undefined

const usePasskey = () => {
    const [passKey, setPasskey] = useLocalStorageState<PasskeyStorageType>(PASSKEY_LOCALSTORAGE_KEY, undefined)
    const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false)

    const setNewPasskey = (value: PasskeyStorageType) => {
        setItem(PASSKEY_LOCALSTORAGE_KEY,'')
        setPasskey(value)
        setIsPasskeyAvailable(false)
    }

    useEffect(()=>{
        if (passKey) {
            setIsPasskeyAvailable(true)
        }
    },[passKey])

    return {
        isPasskeyAvailable,
        passKey,
        setPasskey: setNewPasskey
    }
}

export default usePasskey