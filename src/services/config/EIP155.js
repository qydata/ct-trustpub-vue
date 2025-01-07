/**
 * Supported Chains
 */
export const EIP155_CTCHAIN_CHAINS = {

  'eip155:27': {
    chainId: 27,
    name: 'Ct Chain',
    logo: '/chain-logos/eip155-11155111.png',
    rgb: '99, 125, 234',
    rpc: 'https://ctblock.cn/blockChain',
    namespace: 'eip155'
  }
}

export const EIP155_CHAINS = {
  ...EIP155_CTCHAIN_CHAINS
}

/**
 * Methods
 */
export const EIP155Method = Object.freeze({
  PersonalSign: 'personal_sign',
  RequestAccount: 'request_account',
  EthSign: 'eth_sign',
  EthSignTransaction: 'eth_signTransaction',
  SignTypedData: 'eth_signTypedData',
  SignTypedDataV3: 'eth_signTypedData_v3',
  SignTypedDataV4: 'eth_signTypedData_v4',
  EthSendRawTransaction: 'eth_sendRawTransaction',
  EthSendTransaction: 'eth_sendTransaction',
  SwitchChain: 'wallet_switchEthereumChain',
  AddChain: 'wallet_addEthereumChain'
})
