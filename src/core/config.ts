import { sepolia, type Chain } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'
import { OPTIONAL_METHODS } from '@walletconnect/ethereum-provider'
import { CreateConnectorFn, cookieStorage, createConfig, createStorage, http } from 'wagmi'

// Get projectId at https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const optionalMethods: string[] = [...OPTIONAL_METHODS, 'wallet_grantPermissions']
const connectors: CreateConnectorFn[] = [
  walletConnect({
    projectId,
    metadata,
    showQrModal: false,
    //@ts-ignore
    optionalMethods
  })
]
// Create wagmiConfig
export const config = createConfig({
  chains: [sepolia] as [Chain, ...Chain[]], // required
  transports: {
    11155111: http()
  },
  connectors
})
