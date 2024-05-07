import {
  Address,
  Chain,
  Client,
  Hex,
  Transport,
  encodePacked,
  pad,
  encodeFunctionData,
  encodeAbiParameters
} from 'viem'
import { getAccountNonce } from 'permissionless'
import { EntryPoint } from 'permissionless/types'
import { ethers } from 'ethers'
import { executeAbi } from './abis/Account'
import {
  CALL_TYPE,
  PermissionContext,
  UserOpBuilderAccountUtil,
  UserOpBuilderGetCallDataArguments,
  UserOpBuilderGetNonceArguments,
  UserOpBuilderGetSignatureArguments
} from '../UserOpBuilderAccountUtils'

export class Safe7579AccountUtils implements UserOpBuilderAccountUtil {
  async getSignatureWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetSignatureArguments
  ) {
    const { rawSignature, permissionContext } = args
    const {
      permittedScopeData: permissionData,
      permissions,
      permittedScopeSignature: signatureOnPermissionData
    } = permissionContext
    const _permissionIndex = BigInt(0)
    const encodedData = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'tuple(uint48,uint48,address,bytes,address,bytes)', 'bytes', 'bytes', 'bytes'],
      [
        _permissionIndex,
        [
          permissions[0].validAfter,
          permissions[0].validUntil,
          permissions[0].signatureValidationAlgorithm,
          permissions[0].signer,
          permissions[0].policy,
          permissions[0].policyData
        ],
        permissionData,
        signatureOnPermissionData,
        rawSignature
      ]
    ) as `0x${string}`

    return encodePacked(['uint8', 'bytes'], [1, encodedData])
  }

  async getNonceWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetNonceArguments
  ) {
    const { sender, entryPoint, permissionValidatorAddress } = args

    return await getAccountNonce(client, {
      sender: sender,
      entryPoint: entryPoint,
      key: BigInt(
        pad(permissionValidatorAddress, {
          dir: 'right',
          size: 24
        }) || 0
      )
    })
  }

  async getCallDataWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetCallDataArguments
  ) {
    const callData = this.encodeUserOpCallData({
      actions: args.actions
    })
    return callData
  }

  private encodeUserOpCallData({
    actions
  }: {
    actions: { target: Address; value: bigint; callData: Hex }[]
  }): Hex {
    if (actions.length === 0) {
      throw new Error('No actions')
    } else if (actions.length === 1) {
      const { target, value, callData } = actions[0]
      return encodeFunctionData({
        functionName: 'execute',
        abi: executeAbi,
        args: [
          CALL_TYPE.SINGLE,
          encodePacked(['address', 'uint256', 'bytes'], [target, BigInt(Number(value)), callData])
        ]
      })
    } else {
      return encodeFunctionData({
        functionName: 'execute',
        abi: executeAbi,
        args: [
          CALL_TYPE.BATCH,
          encodeAbiParameters(
            [
              {
                components: [
                  {
                    name: 'target',
                    type: 'address'
                  },
                  {
                    name: 'value',
                    type: 'uint256'
                  },
                  {
                    name: 'callData',
                    type: 'bytes'
                  }
                ],
                name: 'Execution',
                type: 'tuple[]'
              }
            ],
            // @ts-ignore
            [actions]
          )
        ]
      })
    }
  }
}
