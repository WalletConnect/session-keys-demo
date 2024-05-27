import {
  Chain,
  Client,
  Transport,
  publicActions
} from 'viem'
import {
  IUserOperationBuilder,
  UserOpBuilderGetCallDataArguments,
  UserOpBuilderGetNonceArguments,
  UserOpBuilderGetSignatureArguments
} from './types'
import { getCallDataAbi, getNonceAbi, getSignatureAbi } from './abis/userOpBuilderAbi'

export class UserOperationBuilder implements IUserOperationBuilder {
  
  async getSignatureWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetSignatureArguments
  ) {
    const { sender, permissionsContext,userOpBuilderAddress, userOperation } = args
    const publicClient = client.extend(publicActions)
    if(!userOpBuilderAddress) { throw  new Error("no userOpBuilder address provided.")}

    const sig = await publicClient.readContract({
      address: userOpBuilderAddress,
      abi: getSignatureAbi,
      functionName: 'getSignature',
      args:[
        sender,
        userOperation,
        permissionsContext
      ]
    })
    return sig
  }

  async getNonceWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetNonceArguments
  ) {
    const { sender, permissionsContext, userOpBuilderAddress } = args
    const publicClient = client.extend(publicActions)
    if(!userOpBuilderAddress) { throw  new Error("no userOpBuilder address provided.")}
    
    return await publicClient.readContract({
      address: userOpBuilderAddress,
      abi: getNonceAbi,
      functionName: 'getNonce',
      args:[
        sender,
        permissionsContext
      ]
    })
  }

  async getCallDataWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetCallDataArguments
  ) {
    const { sender, actions, permissionsContext, userOpBuilderAddress } = args
    const publicClient = client.extend(publicActions)
    if(!userOpBuilderAddress) { throw  new Error("no userOpBuilder address provided.")}

    const callDataFromUserOpBuilder =  await publicClient.readContract({
      address: userOpBuilderAddress,
      abi: getCallDataAbi,
      functionName: 'getCallData',
      args:[
        sender,
        actions,
        permissionsContext
      ]
    })
    console.log({callDataFromUserOpBuilder})

    return callDataFromUserOpBuilder
  }
}
