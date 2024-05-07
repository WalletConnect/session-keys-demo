import {
  Address,
  Chain,
  Client,
  Hex,
  Transport,
  encodePacked,
  pad,
  encodeFunctionData,
  encodeAbiParameters,
  toFunctionSelector,
  parseAbiParameters,
  zeroAddress,
  publicActions
} from 'viem'
import { getAccountNonce } from 'permissionless'
import { ethers } from 'ethers'
import { executeAbi, isModuleInstalledAbi } from './abis/Account'
import {
  CALL_TYPE,
  UserOpBuilderAccountUtil,
  UserOpBuilderGetCallDataArguments,
  UserOpBuilderGetNonceArguments,
  UserOpBuilderGetSignatureArguments
} from '../UserOpBuilderAccountUtils'

export class KernelV3AccountUtils implements UserOpBuilderAccountUtil {
  async getSignatureWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetSignatureArguments
  ) {
    const { rawSignature, permissionContext, userOperation } = args
    const {
      permissionValidatorAddress,
      permittedScopeData: permissionData,
      permissions,
      permittedScopeSignature: signatureOnPermissionData,
      enableSig
    } = permissionContext
    const _permissionIndex = BigInt(0)
    const permissionValidatorEncodedData = ethers.utils.defaultAbiCoder.encode(
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

    const permissionValidatorRawSignature = encodePacked(
      ['uint8', 'bytes'],
      [1, permissionValidatorEncodedData]
    )
    const publicClient = client.extend(publicActions)

    const isModuleInstalled = await publicClient.readContract({
      address: userOperation.sender,
      abi: isModuleInstalledAbi,
      functionName: 'isModuleInstalled',
      args: [
        BigInt(1), // ModuleType
        permissionValidatorAddress, // Module Address
        '0x' // Additional Context
      ]
    })

    if (isModuleInstalled) return permissionValidatorRawSignature

    console.log('enableSig', enableSig)
    const encodedEnableSignature = this.encodeEnableSignature(
      zeroAddress,
      '0x', // validatorData = module initData
      '0x', // hookData = for permissionValidator there is no hook so '0x'
      this.executeFunctionSelector(), // selectorData method on account to be used  like execute.selector
      enableSig!, // enableSig i.e. signature done by account(wallet side) to authorize the enabing of PermissionValidator module
      permissionValidatorRawSignature // userOperation sig i.e the signature done on userOperation build by dapp signer
    )

    return encodedEnableSignature
  }

  async getNonceWithContext(
    client: Client<Transport, Chain | undefined>,
    args: UserOpBuilderGetNonceArguments
  ) {
    const { sender, entryPoint, permissionValidatorAddress } = args
    const publicClient = client.extend(publicActions)

    const isModuleInstalled = await publicClient.readContract({
      address: sender,
      abi: isModuleInstalledAbi,
      functionName: 'isModuleInstalled',
      args: [
        BigInt(1), // ModuleType
        permissionValidatorAddress, // Module Address
        '0x' // Additional Context
      ]
    })
    console.log(isModuleInstalled)
    if (isModuleInstalled)
      return await getAccountNonce(client, {
        sender: sender,
        entryPoint: entryPoint,
        key: BigInt(
          pad(`0x0001${permissionValidatorAddress.substring(2)}`, {
            //the 00- enable 01- validator 
            dir: 'right',
            size: 24
          }) || 0
        )
      })

    return await getAccountNonce(client, {
      sender: sender,
      entryPoint: entryPoint,
      key: BigInt(
        pad(`0x0101${permissionValidatorAddress.substring(2)}`, {
          //the 0101 indicate validator type and enableMode
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

  private executeFunctionSelector = () => {
    return toFunctionSelector(executeAbi[0])
  }

  private encodeEnableSignature(
    hook: Address,
    validatorData: `0x${string}`,
    hookData: `0x${string}`,
    selectorData: `0x${string}`,
    enableSig: `0x${string}`,
    userOpSig: `0x${string}`
  ): `0x${string}` {
    return encodePacked(
      ['address', 'bytes'],
      [
        encodePacked(['address'], [hook]),
        encodeAbiParameters(
          parseAbiParameters(
            'bytes validatorData, bytes hookData, bytes selectorData, bytes enableSig, bytes userOpSig'
          ),
          [validatorData, hookData, selectorData, enableSig, userOpSig]
        )
      ]
    )
  }
}
