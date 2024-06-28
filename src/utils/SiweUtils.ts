import type { SIWEVerifyMessageArgs, SIWECreateMessageArgs } from '@web3modal/siwe'
import { createSIWEConfig, formatMessage } from '@web3modal/siwe'
import { sepolia, type Chain } from 'wagmi/chains'
import { PrivateKeyAccount, parseEther, zeroAddress } from 'viem'
import { createRecap, encodeRecap } from '@walletconnect/utils'
import { getItem } from '@/core/storage'
import { privateKeyToAccount } from 'viem/accounts'
import { bigIntFormatter, encodeSECP256k1PublicKeyToDID } from './CommonUtils'

export const WagmiConstantsUtil = {
  chains: [sepolia] as [Chain, ...Chain[]]
}

const localSignerPrivateKey = getItem('localSigner')
const localSignerAccount: PrivateKeyAccount | undefined = localSignerPrivateKey
  ? privateKeyToAccount(localSignerPrivateKey as `0x${string}`)
  : undefined

const dappPermissions = {
  signer: {
    type: 'key',
    data: {
      id: localSignerAccount
        ? encodeSECP256k1PublicKeyToDID(localSignerAccount.publicKey)
        : zeroAddress
    }
  },
  permissions: [
    {
      type: 'native-token-limit',
      data: {
        amount: parseEther('1')
      },
      policies: [],
      required: true
    }
  ],
  expiry: Date.now() + 6000000
}

const recap = createRecap(window.location.origin, 'submit transactions with permissons', [
  JSON.stringify(dappPermissions, bigIntFormatter)
])

const encoded = encodeRecap(recap)

export const siweConfig = createSIWEConfig({
  signOutOnAccountChange: true,
  signOutOnNetworkChange: true,
  // We don't require any async action to populate params but other apps might
  getMessageParams: async () => ({
    domain: window.location.host,
    uri: window.location.origin,
    chains: WagmiConstantsUtil.chains.map(chain => chain.id),
    statement: 'Please sign with your account',
    iat: new Date().toISOString(),
    resources: [encoded]
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) => formatMessage(args, address),
  getNonce: async () => {
    // const nonce = await getCsrfToken()
    // if (!nonce) {
    //   throw new Error('Failed to get nonce!')
    // }

    return 'random.csrf'
  },
  getSession: async () => {
    // const session = await getSession()
    // if (!session) {
    //   throw new Error('Failed to get session!')
    // }

    // const { address, chainId } = session as unknown as SIWESession
    let address = ''
    let chainId = 11155111
    return { address, chainId }
  },
  verifyMessage: async ({ message, signature, cacao }: SIWEVerifyMessageArgs) => {
    // try {
    //   /*
    //    * Signed Cacao (CAIP-74) will be available for further validations if the wallet supports caip-222 signing
    //    * When personal_sign fallback is used, cacao will be undefined
    //    */
    //   if (cacao) {
    //     // Do something
    //   }
    //   const success = await signIn('credentials', {
    //     message,
    //     redirect: false,
    //     signature,
    //     callbackUrl: '/protected'
    //   })

    //   return Boolean(success?.ok)
    // } catch (error) {
    //   return false
    // }
    return true
  },
  signOut: async () => {
    // try {
    //   await signOut({
    //     redirect: false
    //   })

    //   return true
    // } catch (error) {
    //   return false
    // }
    return true
  }
})
