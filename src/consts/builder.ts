export const BUILDER_CONTRACT_ADDRESS = '0xa8008EFc52cCAbA2012608349E5C76A25D5c752D'
export const BUILDER_CONTRACT_ABI = [
  {
    type: 'constructor',
    inputs: [{ name: '_entryPoint', type: 'address', internalType: 'address' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'entryPoint',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'contract IEntryPoint' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getCallDataWithContext',
    inputs: [
      { name: '', type: 'address', internalType: 'address' },
      {
        name: 'executions',
        type: 'tuple[]',
        internalType: 'struct Execution[]',
        components: [
          { name: 'target', type: 'address', internalType: 'address' },
          { name: 'value', type: 'uint256', internalType: 'uint256' },
          { name: 'callData', type: 'bytes', internalType: 'bytes' }
        ]
      },
      { name: '', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [{ name: 'callDataWithContext', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'pure'
  },
  {
    type: 'function',
    name: 'getNonceWithContext',
    inputs: [
      { name: 'smartAccount', type: 'address', internalType: 'address' },
      { name: 'permissionsContext', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [{ name: 'nonce', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getSignatureWithContext',
    inputs: [
      { name: 'smartAccount', type: 'address', internalType: 'address' },
      {
        name: 'userOp',
        type: 'tuple',
        internalType: 'struct PackedUserOperation',
        components: [
          { name: 'sender', type: 'address', internalType: 'address' },
          { name: 'nonce', type: 'uint256', internalType: 'uint256' },
          { name: 'initCode', type: 'bytes', internalType: 'bytes' },
          { name: 'callData', type: 'bytes', internalType: 'bytes' },
          { name: 'accountGasLimits', type: 'bytes32', internalType: 'bytes32' },
          { name: 'preVerificationGas', type: 'uint256', internalType: 'uint256' },
          { name: 'gasFees', type: 'bytes32', internalType: 'bytes32' },
          { name: 'paymasterAndData', type: 'bytes', internalType: 'bytes' },
          { name: 'signature', type: 'bytes', internalType: 'bytes' }
        ]
      },
      { name: 'permissionsContext', type: 'bytes', internalType: 'bytes' }
    ],
    outputs: [{ name: 'signature', type: 'bytes', internalType: 'bytes' }],
    stateMutability: 'view'
  }
]
