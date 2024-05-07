import { EntryPoint, UserOperation } from 'permissionless/types'
import { Address, Chain, Client, Transport } from 'viem'

export type SingleSignerPermission = {
  validUntil: number
  validAfter: number
  signatureValidationAlgorithm: Address
  signer: Address
  policy: Address
  policyData: `0x${string}`
}

export type PermissionContext = {
  accountType: 'KernelV3' | 'Safe7579' // need this until we have userOpBuilder contract
  accountAddress: Address
  permissionValidatorAddress: Address
  permissions: SingleSignerPermission[]
  permittedScopeData: `0x${string}`
  permittedScopeSignature: `0x${string}`
  enableSig?: `0x${string}`
}

export const CALL_TYPE = {
  SINGLE: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  BATCH: '0x0100000000000000000000000000000000000000000000000000000000000000' as `0x${string}`
}

export type UserOpBuilderGetSignatureArguments = {
  userOperation: UserOperation<'v0.7'>
  rawSignature: `0x${string}`
  permissionContext: PermissionContext
}
export type UserOpBuilderGetNonceArguments = {
  sender: Address
  entryPoint: EntryPoint
  permissionValidatorAddress: Address
}
export type UserOpBuilderGetCallDataArguments = {
  permissionContext: PermissionContext
  actions: {
    target: Address
    value: bigint
    callData: `0x${string}`
  }[]
}

export interface UserOpBuilderAccountUtil {
  getSignatureWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetSignatureArguments
  ): Promise<`0x${string}`>

  getNonceWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetNonceArguments
  ): Promise<bigint>

  getCallDataWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetCallDataArguments
  ): Promise<`0x${string}`>
}
