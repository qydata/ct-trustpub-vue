import BlockchainInterface from './BlockchainInterface'

const ethers = require('ethers')

export const ctchain = {
  id: 27, // 自定义链的 chainId
  name: 'ctchain', network: 'ct-chain', // 自定义网络名称
  nativeCurrency: {
    name: 'CT', symbol: 'CT', decimals: 18
  }, rpcUrls: {
    default: {
      http: ['https://ctblock.cn/blockChain'] // 自定义链的 RPC URL
    }, public: {
      http: ['https://ctblock.cn/blockChain']
    }
  }, blockExplorers: {
    default: {name: 'CT Explorer', url: 'https://ctblock.cn'}
  }
}

class InfuraEthereum extends BlockchainInterface {
  constructor() {
    super('ctchain', {
      ctchain: ctchain
    })
  }

  /**
   * @param {String} network name of ETH network to connect to. default: 'homestead'
   * @returns InfuraProvider instance
   */
  getProvider() {
    return new ethers.providers.JsonRpcProvider('https://ctblock.cn/blockChain', {
      chainId: 27
    })
  }

  /**
   * @param {String} address wallet to get balance for
   * @returns {String} of balance in ETH
   */
  async getBalance({address, network}) {
    const provider = this.getProvider(network)
    const balance = await provider.getBalance(address)
    return ethers.utils.formatEther(balance)
  }

  /**
   * @param {String} privateKey Wallet privateKey to create Signer instance
   * @param {String} network to use as provider
   * @returns {Wallet} instance of Signer
   */
  getSigner({privateKey}) {
    const provider = this.getProvider()
    const signer = new ethers.Wallet(privateKey, provider)
    return signer
  }
}

export default new InfuraEthereum()
