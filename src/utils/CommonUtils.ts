import bs58 from 'bs58'

export const encodeSecp256k1PublicKeyToDID = (publicKey: string) => {
  // Remove '0x' prefix if present
  publicKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey

  // Convert publicKey to Buffer
  const publicKeyBuffer = Buffer.from(publicKey, 'hex')

  // Base58 encode the address
  const encodedPublicKey = bs58.encode(publicKeyBuffer)

  // Construct the did:key
  return `did:key:zQ3s${encodedPublicKey}`
}

export function bigIntFormatter(_key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString()
  }

  return value
}
