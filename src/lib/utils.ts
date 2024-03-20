import { KernelSmartAccount, createKernelAccountClient, createZeroDevPaymasterClient } from '@zerodev/sdk'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function bufferToString(buff: ArrayBuffer): string{
  return Buffer.from(buff).toString('hex')
}

export function createPublicBundlerClient(){
  const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID
  if (!projectId) {
      throw new Error('ZeroDev project id expected')
  }
  const bundlerRpc = http(`https://rpc.zerodev.app/api/v2/bundler/${projectId}`)

  return createPublicClient({
      transport: bundlerRpc, 
  })
}

export function createKernelClient(account: KernelSmartAccount){
  const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID
  if (!projectId) {
      throw new Error('ZeroDev project id expected')
  }
  
  return createKernelAccountClient({
    account,
    chain: sepolia,
    transport: http(`https://rpc.zerodev.app/api/v2/bundler/${projectId}`),
    sponsorUserOperation: async ({ userOperation }) => { 
        const zerodevPaymaster = createZeroDevPaymasterClient({ 
          chain: sepolia, 
          transport: http(`https://rpc.zerodev.app/api/v2/paymaster/${projectId}`), 
        }) 
        return zerodevPaymaster.sponsorUserOperation({ 
          userOperation 
        }) 
      } 
  })
}


export function getRandomBytes(n: number){
  const QUOTA = 65536
  var a = new Uint8Array(n);
  for (var i = 0; i < n; i += QUOTA) {
    crypto.getRandomValues(a.subarray(i, i + Math.min(n - i, QUOTA)));
  }
  return a;
}

