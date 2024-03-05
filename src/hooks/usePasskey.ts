import { PASSKEY_LOCALSTORAGE_KEY } from "@/consts/storage"
import { useEffect, useState } from "react"
import { useLocalStorageState } from "./useLocalStorageState"
import { PasskeyLocalStorageFormat } from "@/core/passkeys"

const usePasskey = () => {
    const [passKey, setPasskey] = useLocalStorageState<PasskeyLocalStorageFormat | undefined>(PASSKEY_LOCALSTORAGE_KEY, undefined)
    const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false)

    useEffect(()=>{
        if (passKey) {
            setIsPasskeyAvailable(true)
        }
    },[passKey])

    return {
        isPasskeyAvailable,
        passKey,
        setPasskey
    }
}

export default usePasskey