import { EntryPoint, PackedUserOperation } from 'permissionless/types'
import { Address, Chain, Client, Transport } from 'viem'

export interface IUserOperationBuilder {
  getNonceWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetNonceArguments
  ): Promise<bigint>

  getCallDataWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetCallDataArguments
  ): Promise<`0x${string}`>

  getSignatureWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetSignatureArguments
  ): Promise<`0x${string}`>
}

export type Execution = {
  target: Address
  value: bigint
  callData: `0x${string}`
}

export type UserOpBuilderGetSignatureArguments = {
  sender: Address
  userOpBuilderAddress: Address
  userOperation: PackedUserOperation
  permissionsContext: `0x${string}`
}
export type UserOpBuilderGetNonceArguments = {
  sender: Address
  userOpBuilderAddress: Address
  permissionsContext: `0x${string}`
}
export type UserOpBuilderGetCallDataArguments = {
  sender: Address
  userOpBuilderAddress: Address
  permissionsContext: `0x${string}`
  actions: Execution[]
}
