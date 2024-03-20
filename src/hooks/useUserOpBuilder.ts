import { readContract } from '@wagmi/core'
import { BUILDER_CONTRACT_ABI, BUILDER_CONTRACT_ADDRESS } from "@/consts/builder"
import { config } from '@/core/config'
import { Address, Hex, numberToHex } from 'viem'


type BaseArgs = {
    address: Address,
    permissionContext: Hex
}

type GetNonceArgs = BaseArgs

type Execution = {
    target: Hex,
    value: Hex,
    callData: Hex
}

type GetCallDataArgs = {
    executions: Execution[]
} & BaseArgs

type PackedUserOp = {
    sender: string,
    nonce: string,
    initCode: string,
    callData: string,
    accountGasLimits: string,
    preVerificationGas: string,
    gasFees: string,
    paymasterAndData: string,
    signature: string
}

type GetSignatureArgs = {
    userOp: PackedUserOp
} & BaseArgs

export const useUserOpBuilder = () => { 

    const getNonce = async ({address, permissionContext}: GetNonceArgs) => {
        return readContract(config, {
            abi: BUILDER_CONTRACT_ABI,
            address: BUILDER_CONTRACT_ADDRESS,
            functionName: 'getNonceWithContext',
            args: [
                address,
                permissionContext
            ]
        })
    }

    const getCallData = async ({address, permissionContext, executions}: GetCallDataArgs) => {
        return readContract(config, {
            abi: BUILDER_CONTRACT_ABI,
            address: BUILDER_CONTRACT_ADDRESS,
            functionName: 'getCallDataWithContext',
            args: [
                address,
                executions,
                permissionContext
            ]
        })
    }

    const getSignature = async ({address, userOp, permissionContext}: GetSignatureArgs) => {
        return readContract(config, {
            abi: BUILDER_CONTRACT_ABI,
            address: BUILDER_CONTRACT_ADDRESS,
            functionName: 'getSignatureWithContext',
            args: [
                address,
                userOp,
                permissionContext
            ]
        })
    }
    
    return {
        getNonce,
        getCallData,
        getSignature
    }

}