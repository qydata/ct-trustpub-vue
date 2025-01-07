class BlockchainInterface {
  /**
   * @param {String} name Name to identify blockchain interface instance as.
   * @param {Object} networks Object with network key value pairs to assist with API configuration. { homestead: 'https://mainnet.infura.io', ropsten: 'https://ropsten.infura.io' }
   */
  constructor(name, networks) {
    if (!name || !networks) throw new Error('Expected two parameters. name: string, networks: object')
    this.network = ''
    this.interfaceName = name
    this.networks = networks
  }

}

export default BlockchainInterface
