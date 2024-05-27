'use client'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useLocalSigner } from '@/hooks/useLocalSigner'
import { donutContractAbi, donutContractaddress } from '@/consts/contract'
import { createPublicClient, encodeFunctionData, http, parseEther, signatureToHex } from 'viem'
import { useAccount, useSignTypedData } from 'wagmi'
import { permissionsDomain, permissionsTypes } from '@/consts/typedData'
import { useState } from 'react'
import {
  ENTRYPOINT_ADDRESS_V07,
  createBundlerClient,
  getPackedUserOperation,
  getUserOperationHash
} from 'permissionless'
import { pimlicoBundlerActions } from 'permissionless/actions/pimlico'
import { UserOperation } from 'permissionless/types'
import { sign } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import { IssuePermissionsResponse } from '@/lib/ERC7715/types'
import { Execution } from '@/lib/UserOperationBuilderUtil/types'
import { UserOperationBuilder } from '@/lib/UserOperationBuilderUtil'

export default function LocalPrivateKeySection() {
  const { isConnected } = useAccount()
  const { signer, signerPrivateKey } = useLocalSigner()
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const [isTransactionPending, setTransactionPending] = useState<boolean>(false)
  const { signTypedDataAsync } = useSignTypedData()
  const [issuePermissionsResponse, setIssuePermissionsResponse] =
    useState<IssuePermissionsResponse>()
  const { toast } = useToast()

  const handleTxWithLocalKey = async () => {
    setTransactionPending(true)
    try {
      if (!issuePermissionsResponse) throw Error('No permissions available')
      const callData = encodeFunctionData({
        abi: donutContractAbi,
        functionName: 'purchase',
        args: [1]
      })

      await buildAndSendTransactionsWithPermissions(issuePermissionsResponse, [
        {
          target: donutContractaddress,
          value: parseEther('0.0001'),
          callData: callData
        }
      ])
      toast({
        title: 'Signing with local key successfully completed'
      })
    } catch (error) {
      console.log('Signing error', error)
      toast({
        title: 'Error while trying to sign with local private key'
      })
    }
    setTransactionPending(false)
  }

  async function buildAndSendTransactionsWithPermissions(
    issuedPermissionsResponse: IssuePermissionsResponse,
    actions: Execution[]
  ) {
    const apiKey = process.env.NEXT_PUBLIC_PIMLICO_KEY
    const bundlerUrl = `https://api.pimlico.io/v1/sepolia/rpc?apikey=${apiKey}`
    const entryPoint = ENTRYPOINT_ADDRESS_V07
    const publicClient = createPublicClient({
      transport: http(),
      chain: sepolia
    })

    const bundlerClient = createBundlerClient({
      transport: http(bundlerUrl),
      entryPoint: entryPoint,
      chain: sepolia
    }).extend(pimlicoBundlerActions(entryPoint))

    const paymasterUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`

    const {
      initCode,
      accountAddress,
      userOperationBuilder: userOpBuilderAddress,
      permissionsContext
    } = issuedPermissionsResponse

    const testDappPrivateKey = signerPrivateKey! as `0x${string}`
    const dappAccount = signer!
    console.log('dappAccount(permitted Signer) Address: ', dappAccount.address)

    const userOperationBuilder = new UserOperationBuilder()

    const nonce = await userOperationBuilder.getNonceWithContext(publicClient, {
      userOpBuilderAddress: userOpBuilderAddress!,
      sender: accountAddress,
      permissionsContext: permissionsContext!
    })

    console.log({ nonce })
    const callData = await userOperationBuilder.getCallDataWithContext(publicClient, {
      sender: accountAddress,
      userOpBuilderAddress: userOpBuilderAddress!,
      permissionsContext: permissionsContext!,
      actions
    })
    console.log({ callData })

    const gasPrice = await bundlerClient.getUserOperationGasPrice()
    const userOp: UserOperation<'v0.7'> = {
      sender: accountAddress as `0x${string}`,
      factory:
        initCode && initCode !== '0x' ? (initCode.substring(0, 42) as `0x${string}`) : undefined,
      factoryData:
        initCode && initCode !== '0x'
          ? (`0x${initCode.substring(42)}` as `0x${string}`)
          : undefined,
      nonce: nonce,
      callData: callData,
      callGasLimit: BigInt(2000000),
      verificationGasLimit: BigInt(2000000),
      preVerificationGas: BigInt(2000000),
      maxFeePerGas: gasPrice.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
      signature: '0x'
    }
    console.log('Partial userOperation to get userOpHash :', { userOp })

    const userOpHash = getUserOperationHash({
      userOperation: {
        ...userOp
      },
      entryPoint: entryPoint,
      chainId: sepolia.id
    })
    console.log('userOpHash : ', userOpHash)

    const dappSignatureOnUserOp = await sign({
      privateKey: testDappPrivateKey,
      hash: userOpHash
    })
    const rawSignature = signatureToHex(dappSignatureOnUserOp)
    console.log('Raw signature on UserOpHash: ', rawSignature)
    userOp.signature = rawSignature
    const preSignaturePackedUserOp = getPackedUserOperation(userOp)
    const finalSigForValidator = await userOperationBuilder.getSignatureWithContext(publicClient, {
      sender: accountAddress,
      permissionsContext: permissionsContext!,
      userOperation: preSignaturePackedUserOp,
      userOpBuilderAddress: userOpBuilderAddress!
    })

    userOp.signature = finalSigForValidator
    console.log('Final UserOp to send', userOp)

    const packedUserOp = getPackedUserOperation(userOp)
    console.log('Final Packed UserOp to send', JSON.stringify(packedUserOp))

    const _userOpHash = await bundlerClient.sendUserOperation({
      userOperation: userOp
    })

    let txReceipt = await bundlerClient.waitForUserOperationReceipt({
      hash: _userOpHash
    })

    return txReceipt.receipt.transactionHash
  }

  async function onRequestPermissions() {
    setRequestPermissionLoading(true)

    try {
      const permissions = [
        {
          target: donutContractaddress,
          abi: donutContractAbi,
          valueLimit: parseEther('10'),
          // @ts-ignore
          functionName: 'purchase'
        }
      ]

      const targetAddress = signer?.address
      if (!targetAddress) {
        throw new Error('Local signer not initialized')
      }
      const serializedPermissionContext = await signTypedDataAsync({
        domain: permissionsDomain,
        message: {
          targetAddress,
          permissions: JSON.stringify(permissions),
          //@ts-ignore
          scope: [
            {
              description: 'Interact with Donut contract'
            },
            {
              description: 'Spend up to 0.5 ETH in a transaction'
            },
            {
              description: 'Maximum of 5 ETH spent per 30 days'
            },
            {
              description: 'Session key valid for 7 days'
            }
          ]
        },
        primaryType: 'PermissionRequest',
        types: permissionsTypes
      })
      toast({ title: 'Success', description: 'Permissions granted successfully' })

      console.log('Permissions granted successfully', {
        permissionsContext: serializedPermissionContext
      })
      const issuedPermissionsResponse =
        serializedPermissionContext as unknown as IssuePermissionsResponse
      if (issuedPermissionsResponse) setIssuePermissionsResponse(issuedPermissionsResponse)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to obtain permissions'
      })
      console.log(error)
    }
    setRequestPermissionLoading(false)
  }

  function handlePermissionClear() {
    setIssuePermissionsResponse(undefined)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sync Flow with Secp256K1 key</CardTitle>
        </CardHeader>
        <CardContent>
          {signerPrivateKey && signer && (
            <div className="flex flex-col gap-2">
              <p className="text-sm">{`${signer.address.substring(0, 5)}...${signer.address.substring(16, 22)}`}</p>
              <Button
                disabled={
                  isRequestPermissionLoading ||
                  issuePermissionsResponse !== undefined ||
                  !isConnected
                }
                onClick={onRequestPermissions}
              >
                {isRequestPermissionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approve/Reject on wallet
                  </>
                ) : (
                  <>Request Permission</>
                )}
              </Button>
              <Button
                disabled={!issuePermissionsResponse || isTransactionPending}
                onClick={handleTxWithLocalKey}
              >
                {isTransactionPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Purchasing...
                  </>
                ) : (
                  <>Purchase Donut</>
                )}
              </Button>
              <Button
                disabled={!issuePermissionsResponse || isTransactionPending}
                onClick={handlePermissionClear}
              >
                Clear Permission
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
