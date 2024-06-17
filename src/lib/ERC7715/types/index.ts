import { Address } from 'viem'

export type IssuePermissionsResponse = {
  entryPoint: Address
  accountAddress: Address
  initCode?: `0x${string}`
  permissionsContext: `0x${string}`
  userOperationBuilder: Address
}
