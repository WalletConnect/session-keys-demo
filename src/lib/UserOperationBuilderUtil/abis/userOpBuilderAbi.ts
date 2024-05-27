export const getNonceWithContextAbi = [
  {
    type: 'function',
    name: 'getNonceWithContext',
    inputs: [
      {
        name: 'smartAccount',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'permissionsContext',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    outputs: [
      {
        name: 'nonce',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    stateMutability: 'view'
  }
] as const

export const getCallDataWithContextAbi = [
  {
    type: 'function',
    name: 'getCallDataWithContext',
    inputs: [
      {
        name: 'smartAccount',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'executions',
        type: 'tuple[]',
        internalType: 'struct Execution[]',
        components: [
          {
            name: 'target',
            type: 'address',
            internalType: 'address'
          },
          {
            name: 'value',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'callData',
            type: 'bytes',
            internalType: 'bytes'
          }
        ]
      },
      {
        name: 'permissionsContext',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    outputs: [
      {
        name: 'callDataWithContext',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    stateMutability: 'view'
  }
] as const

export const getSignatureWithContextAbi = [
  {
    type: 'function',
    name: 'getSignatureWithContext',
    inputs: [
      {
        name: 'smartAccount',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'userOp',
        type: 'tuple',
        internalType: 'struct PackedUserOperation',
        components: [
          {
            name: 'sender',
            type: 'address',
            internalType: 'address'
          },
          {
            name: 'nonce',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'initCode',
            type: 'bytes',
            internalType: 'bytes'
          },
          {
            name: 'callData',
            type: 'bytes',
            internalType: 'bytes'
          },
          {
            name: 'accountGasLimits',
            type: 'bytes32',
            internalType: 'bytes32'
          },
          {
            name: 'preVerificationGas',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'gasFees',
            type: 'bytes32',
            internalType: 'bytes32'
          },
          {
            name: 'paymasterAndData',
            type: 'bytes',
            internalType: 'bytes'
          },
          {
            name: 'signature',
            type: 'bytes',
            internalType: 'bytes'
          }
        ]
      },
      {
        name: 'permissionsContext',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    outputs: [
      {
        name: 'signature',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    stateMutability: 'view'
  }
] as const

export const getNonceAbi = [
  {
    type: 'function',
    name: 'getNonce',
    inputs: [
      {
        name: 'smartAccount',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'permissionsContext',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    outputs: [
      {
        name: 'nonce',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    stateMutability: 'view'
  }
] as const

export const getCallDataAbi = [
  {
    type: 'function',
    name: 'getCallData',
    inputs: [
      {
        name: 'smartAccount',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'executions',
        type: 'tuple[]',
        internalType: 'struct Execution[]',
        components: [
          {
            name: 'target',
            type: 'address',
            internalType: 'address'
          },
          {
            name: 'value',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'callData',
            type: 'bytes',
            internalType: 'bytes'
          }
        ]
      },
      {
        name: 'permissionsContext',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    outputs: [
      {
        name: 'callData',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    stateMutability: 'view'
  }
] as const

export const getSignatureAbi = [
  {
    type: 'function',
    name: 'getSignature',
    inputs: [
      {
        name: 'smartAccount',
        type: 'address',
        internalType: 'address'
      },
      {
        name: 'userOp',
        type: 'tuple',
        internalType: 'struct PackedUserOperation',
        components: [
          {
            name: 'sender',
            type: 'address',
            internalType: 'address'
          },
          {
            name: 'nonce',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'initCode',
            type: 'bytes',
            internalType: 'bytes'
          },
          {
            name: 'callData',
            type: 'bytes',
            internalType: 'bytes'
          },
          {
            name: 'accountGasLimits',
            type: 'bytes32',
            internalType: 'bytes32'
          },
          {
            name: 'preVerificationGas',
            type: 'uint256',
            internalType: 'uint256'
          },
          {
            name: 'gasFees',
            type: 'bytes32',
            internalType: 'bytes32'
          },
          {
            name: 'paymasterAndData',
            type: 'bytes',
            internalType: 'bytes'
          },
          {
            name: 'signature',
            type: 'bytes',
            internalType: 'bytes'
          }
        ]
      },
      {
        name: 'permissionsContext',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    outputs: [
      {
        name: 'signature',
        type: 'bytes',
        internalType: 'bytes'
      }
    ],
    stateMutability: 'view'
  }
] as const
