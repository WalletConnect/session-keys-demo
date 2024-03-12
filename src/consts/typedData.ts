import { sepolia } from "viem/chains"

export const testTypes = {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' }
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' }
    ]
  } as const
  
export const testMessage = {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
    },
    contents: 'Hello, Bob!',
  } as const


export const testDomain = {
    name: 'Ether Mail',
    version: '1',
    chainId: sepolia?.id,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  } as const


/**
 * Permissions
 */
export const permissionsDomain = {
    name: 'eth_getPermissions_v1',
    version: '1',
    chainId: sepolia?.id,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
  } as const
  export const permissionsTypes = {
    PermissionRequest: [
      { name: 'targetAddress', type: 'address' },
      { name: 'permissions', type: 'string' }
    ],
    PermissionAction: [
      { name: 'description', type: 'string' }
    ],
    PermissionScope: [
      { name: 'scope', type: 'PermissionAction[]' } 
    ]
  } as const

  export const permissionsMessage = {
    targetAddress: '0x9DaEC368Fa54279a43ADb4d5F5282B55B33D7392',
  } as const
