'use client'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useLocalSigner } from '@/hooks/useLocalSigner'
import { donutContractAbi, donutContractaddress } from '@/consts/contract'
import {
  createPublicClient,
  createWalletClient,
  custom,
  encodeFunctionData,
  http,
  parseEther,
  signatureToHex
} from 'viem'
import { GrantPermissionsReturnType } from 'viem/experimental'
import { walletActionsErc7715 } from 'viem/experimental'
import { useAccount } from 'wagmi'
import { useState } from 'react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
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
import { Execution } from '@/lib/UserOperationBuilderUtil/types'
import { UserOperationBuilder } from '@/lib/UserOperationBuilderUtil'

export default function LocalPrivateKeySection() {
  const { isConnected, connector } = useAccount()
  const { signer, signerPrivateKey } = useLocalSigner()
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const [isTransactionPending, setTransactionPending] = useState<boolean>(false)
  const [grantPermissionsResponse, setGrantPermissionsResponse] =
    useState<GrantPermissionsReturnType>()
  const { toast } = useToast()

  const handleTxWithLocalKey = async () => {
    setTransactionPending(true)
    try {
      if (!grantPermissionsResponse) throw Error('No permissions available')
      const callData = encodeFunctionData({
        abi: donutContractAbi,
        functionName: 'purchase',
        args: [1]
      })

      await buildAndSendTransactionsWithPermissions(grantPermissionsResponse, [
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
    issuedPermissionsResponse: GrantPermissionsReturnType,
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

    const { factory, factoryData, signerData, permissionsContext } = issuedPermissionsResponse

    const testDappPrivateKey = signerPrivateKey! as `0x${string}`
    const dappAccount = signer!
    console.log('dappAccount(permitted Signer) Address: ', dappAccount.address)

    const userOperationBuilder = new UserOperationBuilder()

    const nonce = await userOperationBuilder.getNonceWithContext(publicClient, {
      userOpBuilderAddress: signerData?.userOpBuilder!,
      sender: signerData?.submitToAddress!,
      permissionsContext: permissionsContext! as `0x${string}`
    })

    console.log({ nonce })
    const callData = await userOperationBuilder.getCallDataWithContext(publicClient, {
      userOpBuilderAddress: signerData?.userOpBuilder!,
      sender: signerData?.submitToAddress!,
      permissionsContext: permissionsContext! as `0x${string}`,
      actions
    })
    console.log({ callData })

    const gasPrice = await bundlerClient.getUserOperationGasPrice()
    const userOp: UserOperation<'v0.7'> = {
      sender: signerData?.submitToAddress!,
      factory,
      factoryData: factoryData ? (factoryData as `0x${string}`) : undefined,
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
      sender: signerData?.submitToAddress!,
      permissionsContext: permissionsContext! as `0x${string}`,
      userOperation: preSignaturePackedUserOp,
      userOpBuilderAddress: signerData?.userOpBuilder!
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
      const targetAddress = signer?.address
      if (!targetAddress) {
        throw new Error('Local signer not initialized')
      }
      const _walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(
          (await connector?.getProvider()) as unknown as Awaited<
            ReturnType<(typeof EthereumProvider)['init']>
          >
        )
      }).extend(walletActionsErc7715())

      const grantPermissionsResponse = await _walletClient.grantPermissions({
        expiry: 1716846083638,
        permissions: [
          {
            type: 'native-token-transfer',
            data: {
              ticker: 'ETH'
            },
            policies: [
              {
                type: 'token-allowance',
                data: {
                  allowance: parseEther('1')
                }
              }
            ]
          }
        ],
        signer: {
          type: 'key',
          data: {
            id: targetAddress
          }
        }
      })
      console.log({ grantPermissionsResponse })
      if (grantPermissionsResponse) {
        setGrantPermissionsResponse(grantPermissionsResponse)
        setRequestPermissionLoading(false)
        toast({ title: 'Success', description: 'Permissions granted successfully' })
        return
      }
      toast({ title: 'Error', description: 'Failed to obtain permissions' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to obtain permissions'
      })
      console.log(error)
      setRequestPermissionLoading(false)
    }
  }

  function handlePermissionClear() {
    setGrantPermissionsResponse(undefined)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>With local secp256K1 key</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {signerPrivateKey && signer && (
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle className="mb-2">Key Details</CardTitle>
                <div className="grid gap-2 text-sm">
                  <p className="break-all">
                    <span className="font-semibold">Address:</span> {signer.address}
                  </p>
                  <p className="break-all">
                    <span className="font-semibold">PrivateKey:</span> {signerPrivateKey}
                  </p>
                </div>
              </div>

              <div>
                <CardTitle className="mb-2">Permissions</CardTitle>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    disabled={
                      isRequestPermissionLoading ||
                      grantPermissionsResponse !== undefined ||
                      !isConnected
                    }
                    onClick={onRequestPermissions}
                  >
                    {isRequestPermissionLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Check on wallet
                      </>
                    ) : (
                      <>Request Permission</>
                    )}
                  </Button>
                  <Button
                    disabled={!grantPermissionsResponse || isTransactionPending}
                    onClick={handlePermissionClear}
                  >
                    Clear Permission
                  </Button>
                </div>
              </div>

              <div>
                <CardTitle className="mb-2">Donut contract</CardTitle>
                <Button
                  disabled={!grantPermissionsResponse || isTransactionPending}
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
