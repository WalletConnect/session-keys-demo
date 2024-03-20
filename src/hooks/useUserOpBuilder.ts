import { readContract } from '@wagmi/core'
import { BUILDER_CONTRACT_ABI, BUILDER_CONTRACT_ADDRESS } from "@/consts/builder"
import { config } from '@/core/config'
import { getRandomBytes } from '@/lib/utils'
import { concat, numberToHex, toHex } from 'viem'



export const useUserOpBuilder = () => { 

    const permissionContext = toHex(getRandomBytes(20))
    const userOp = {
        "sender": "0xce6e5a92132A407D969bF73aF11e99e47dd59afC",
        "nonce": "0x7c42ac84921adc1250409c6ba61afe22a0f2a3bd0000000000000004",
        "initCode": "0x",
        "callData": "0x519454470000000000000000000000002d29e46018da800463152c7f0f3dfce3047d6b2c00000000000000000000000000000000000000000000000000005af3107a4000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024efef39a1000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000",
        "paymasterAndData": "0x",
        "signature": "0x000000017C42aC84921Adc1250409c6ba61AfE22A0F2a3bdfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002d29e46018da800463152c7f0f3dfce3047d6b2cefef39a1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008ac7230489e800000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001acdd56afddbfa8b9ff4f2772199591630331bd91e35dfa9606cba28610aa91db",
        "maxFeePerGas": "0x3b9ad232",
        "maxPriorityFeePerGas": "0x3b9aca00",
        "callGasLimit": "0x0",
        "verificationGasLimit": "0x0",
        "preVerificationGas": "0x0"
    }

    const getNonce = async () => {
        return readContract(config, {
            abi: BUILDER_CONTRACT_ABI,
            address: BUILDER_CONTRACT_ADDRESS,
            functionName: 'getNonceWithContext',
            args: [
                '0x32e5033875F1744a6E85bCCf96625482E4295Cf5',
                permissionContext
            ]
        })
    }

    const getCallData = async () => {

        let execution = concat([
            '0x32e5033875F1744a6E85bCCf96625482E4295Cf5',
            numberToHex(123),
            // DAI Transfer to random address
            '0xa9059cbb000000000000000000000000aabbccddeeff00112233aabbccddeeff0011223300000000000000000000000000000000000000000000000002c68af0bb140000'
        ])
        
        return readContract(config, {
            abi: BUILDER_CONTRACT_ABI,
            address: BUILDER_CONTRACT_ADDRESS,
            functionName: 'getCallDataWithContext',
            args: [
                '0x32e5033875F1744a6E85bCCf96625482E4295Cf5',
                [execution],
                permissionContext
            ]
        })
    }

    const getSignature = async () => {

        
        return readContract(config, {
            abi: BUILDER_CONTRACT_ABI,
            address: BUILDER_CONTRACT_ADDRESS,
            functionName: 'getSignatureWithContext',
            args: [
                '0x32e5033875F1744a6E85bCCf96625482E4295Cf5',
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