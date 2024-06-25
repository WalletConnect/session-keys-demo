import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { customWalletConnect } from './customWCConnector'
import { sepolia } from 'wagmi/chains'
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
const connectors: CreateConnectorFn[] = [
  customWalletConnect({
    projectId,
    metadata,
    showQrModal: true
  })
]
// Create wagmiConfig
export const config = createConfig({
  chains: [sepolia], // required
  transports: {
    11155111: http()
  },
  // projectId, // required
  // metadata, // required
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  connectors
  // enableWalletConnect: true, // Optional - true by default
  // enableInjected: false,
  // enableEIP6963: false,
  // enableCoinbase: false
})
