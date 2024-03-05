export const WALLET_URL = process.env['NEXT_PUBLIC_WALLET_URL'] || 'https://react-wallet.walletconnect.com/'
export const CUSTOM_WALLETS = [
    {
      id: 'react-wallet-v2',
      name: 'react-wallet-v2',
      homepage: WALLET_URL,
      mobile_link: WALLET_URL,
      desktop_link: WALLET_URL,
      webapp_link: WALLET_URL
    }
  ]