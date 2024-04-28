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

export type SingleSignerPermission = {
  validUntil: number
  validAfter: number
  signatureValidationAlgorithm: Address
  signer: Address
  policy: Address
  policyData: `0x${string}`
}

export type PermissionContext = {
  accountAddress: Address
  permissionValidatorAddress: Address
  permissions: SingleSignerPermission[]
  permittedScopeData: `0x${string}`
  permittedScopeSignature: `0x${string}`
}

export async function getSignatureWithContext(
  rawSignature: `0x${string}`,
  permissionContext: PermissionContext
) {
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
        0,
        0,
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

export async function getNonceWithContext(
  client: Client<Transport, Chain | undefined>,
  args: { sender: Address; entryPoint: EntryPoint; permissionValidatorAddress: Address }
) {
  return await getAccountNonce(client, {
    sender: args.sender,
    entryPoint: args.entryPoint,
    key: BigInt(
      pad(args.permissionValidatorAddress, {
        dir: 'right',
        size: 24
      }) || 0
    )
  })
}

export async function getCallDataWithContext(
  permissionContext: PermissionContext,
  actions: { target: Address; value: bigint; callData: Hex }[]
) {
  const callData = encodeUserOpCallData({
    actions: actions
  })
  return callData
}

export const CALL_TYPE = {
  SINGLE: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  BATCH: '0x0100000000000000000000000000000000000000000000000000000000000000' as `0x${string}`
}

export function encodeUserOpCallData({
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
